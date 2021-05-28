import Vue from "vue";
import Vuex from "vuex";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TempleWallet } from "@temple-wallet/dapp";
import { NetworkType } from "@airgap/beacon-sdk";
import {
  QSAsset,
  getTokens,
  getNetwork,
  getCustomTokens,
  LOGO_URL,
  ReadOnlySigner,
  michelEncoder,
  getTokenMetadata,
  QSTokenType,
  formatImgUri,
  getContract,
  filteredWhitelist,
  sharesFromNat,
  getDexShares,
  getDexStorage,
  findTezDex,
} from "@/core";
import { TezosToolkit } from "@taquito/taquito";
import { Route } from "vue-router";
import router from "../router";
import { MAINNET_POOLS_TO_MIGRATE } from "../pools-to-migrate";
import BigNumber from "bignumber.js";

Vue.use(Vuex);

interface StoreState {
  tokensLoading: boolean;
  tokens: QSAsset[];
  account: { pkh: string };
  poolsToMigrate: any[];
}

const store = new Vuex.Store<StoreState>({
  state: {
    tokensLoading: false,
    tokens: [],
    account: getAccountInitial(),
    poolsToMigrate: [],
  },
  mutations: {
    tokensLoading(state, tokensLoading) {
      state.tokensLoading = tokensLoading;
    },
    tokens(state, tokens) {
      state.tokens = tokens;
    },
    addToken(state, token) {
      state.tokens = [token, ...state.tokens];
    },
    account(state, account) {
      state.account = account;
    },
    setPoolsToMigrate(state, pools) {
      state.poolsToMigrate = pools;
    },
    pushPoolToMigrate(state, pool) {
      state.poolsToMigrate.push(pool);
    },
  },
});

export default store;

export async function loadPoolsToMigrate() {
  try {
    const me = store.state.account.pkh;
    if (getNetwork().type === "main" && me) {
      store.commit("setPoolsToMigrate", []);
      await Promise.all(
        MAINNET_POOLS_TO_MIGRATE.map(async pool => {
          const storage = await getDexStorage(pool.dexAddress);
          const ledger = storage.ledger || storage.accounts;

          const [val, voter] = await Promise.all([
            ledger.get(me),
            storage.voters.get(me),
          ]);

          const totalShares = val
            ? new BigNumber(val.balance).plus(val.frozen_balance)
            : null;
          const voteShares = voter ? new BigNumber(voter.vote) : null;
          const vetoShares = voter ? new BigNumber(voter.veto) : null;

          if (totalShares && totalShares.isGreaterThan(0)) {
            store.commit("pushPoolToMigrate", {
              ...pool,
              totalShares: totalShares.toFixed(),
              totalSharesToDisplay: sharesFromNat(totalShares).toFixed(),
              voteShares: voteShares && voteShares.toFixed(),
              vetoShares: vetoShares && vetoShares.toFixed(),
              me,
            });
          }
        })
      );
    } else {
      store.commit("setPoolsToMigrate", []);
    }
  } catch (_err) {}
}
loadPoolsToMigrate();

store.subscribe(mutation => {
  if (mutation.type === "account") {
    loadPoolsToMigrate();
  }
});

loadTokens();
router.onReady((route: Route) => {
  [route.query.from, route.query.to, route.params.token].forEach(assetSlug => {
    if (assetSlug && assetSlug !== "tez") {
      try {
        const [tokenAddress, fa2TokenId] = (assetSlug as any).split("_");
        loadCustomTokenIfExist(tokenAddress, fa2TokenId);
      } catch {}
    }
  });
});

export async function loadTokens() {
  try {
    store.commit("tokensLoading", true);
    store.commit("tokens", await getTokens());
  } catch (err) {
    console.error(err);
  } finally {
    store.commit("tokensLoading", false);
  }
}

export async function loadCustomTokenIfExist(
  contractAddress: string,
  fa2TokenId?: number
) {
  try {
    const currentCustom = getCustomTokens();
    if (
      filteredWhitelist.some(wt =>
        wt.fa2TokenId !== undefined
          ? wt.contractAddress === contractAddress &&
            wt.fa2TokenId === fa2TokenId
          : wt.contractAddress === contractAddress
      ) ||
      currentCustom.some((ct: QSAsset) =>
        ct.tokenType === QSTokenType.FA2
          ? ct.id === contractAddress && ct.fa2TokenId === fa2TokenId
          : ct.id === contractAddress
      )
    ) {
      return;
    }

    const metadata = await getTokenMetadata(contractAddress, fa2TokenId);
    addCustomToken({
      type: "token" as const,
      tokenType: fa2TokenId !== undefined ? QSTokenType.FA2 : QSTokenType.FA1_2,
      id: contractAddress,
      fa2TokenId,
      decimals: metadata.decimals,
      symbol: metadata.symbol,
      name: metadata.name,
      imgUrl: formatImgUri(metadata.thumbnailUri),
      exchange: "",
    });
  } catch {}
}

export function addCustomToken(token: QSAsset) {
  try {
    const current = getCustomTokens();
    const net = getNetwork();
    localStorage.setItem(
      `custom_tokens_v1.2_${net.id}`,
      JSON.stringify([token, ...current])
    );
  } catch {}
  store.commit("addToken", token);
}

const beaconWallet = new BeaconWallet({
  name: "Quipuswap",
  iconUrl: LOGO_URL,
});

export async function useWallet(
  connectType?: "temple" | "beacon",
  forcePermission = false
) {
  if (!forcePermission && !getAccount().pkh) {
    throw new Error("Not connected");
  }

  if (!connectType) {
    const last = getLastUsedConnect();
    if (!last) {
      signout();
      throw new Error("Not connected");
    }

    connectType = last;
  }

  return connectType === "temple"
    ? useWalletTemple(forcePermission)
    : useWalletBeacon(forcePermission);
}

class PatchedTempleWallet extends TempleWallet {
  async sendOperations(opParams: any[]) {
    return super.sendOperations(opParams.map(removeFeeAndLimit));
  }
}

function removeFeeAndLimit(op: any) {
  const { fee, gas_limit, storage_limit, ...rest } = op;
  return rest;
}

async function useWalletTemple(forcePermission: boolean) {
  const net = getNetwork();

  const available = await TempleWallet.isAvailable();
  if (!available) {
    throw new Error("Temple Wallet not installed");
  }

  let perm;
  if (!forcePermission) {
    perm = await TempleWallet.getCurrentPermission();
  }

  const wallet = new PatchedTempleWallet("Quipuswap", perm);

  if (!wallet.connected) {
    await wallet.connect(
      net.connectType === "default"
        ? (net.id as any)
        : {
            name: net.name,
            rpc: net.rpcBaseURL,
          },
      { forcePermission: true }
    );
  }

  const tezos = wallet.toTezos();
  tezos.setPackerProvider(michelEncoder);
  const { pkh, publicKey } = wallet.permission!;
  tezos.setSignerProvider(new ReadOnlySigner(pkh, publicKey));
  setLastUsedConnect("temple");
  if (getAccount().pkh !== pkh) {
    setAccount(pkh);
  }
  return tezos;
}

async function useWalletBeacon(forcePermission: boolean) {
  const net = getNetwork();

  const activeAccount = await beaconWallet.client.getActiveAccount();
  if (forcePermission || !activeAccount) {
    if (activeAccount) {
      await beaconWallet.clearActiveAccount();
    }
    await beaconWallet.requestPermissions({
      // network: { type: toBeaconNetworkType(net.id) },
      network:
        net.connectType === "custom" && net.type === "test"
          ? {
              type: NetworkType.CUSTOM,
              name: net.name,
              rpcUrl: net.rpcBaseURL,
            }
          : { type: toBeaconNetworkType(net.id) },
    });
  }

  const tezos = new TezosToolkit(net.rpcBaseURL);
  tezos.setPackerProvider(michelEncoder);
  tezos.setWalletProvider(beaconWallet);
  const activeAcc = await beaconWallet.client.getActiveAccount();
  if (!activeAcc) {
    throw new Error("Not connected");
  }

  tezos.setSignerProvider(
    new ReadOnlySigner(activeAcc.address, activeAcc.publicKey)
  );
  setLastUsedConnect("beacon");
  if (getAccount().pkh !== activeAcc.address) {
    setAccount(activeAcc.address);
  }
  return tezos;
}

export function getAccount() {
  return store.state.account;
}

export function setAccount(pkh: string) {
  localStorage.setItem("accpkh", pkh);
  store.commit("account", { pkh });
}

export function signout() {
  cleanLastUsedConnect();
  localStorage.removeItem("accpkh");
  store.commit("account", { pkh: "" });
}

function getAccountInitial() {
  const pkh = localStorage.getItem("accpkh");
  return { pkh: pkh || "" };
}

function toBeaconNetworkType(netId: string): any {
  return netId === "edo2net" ? "edonet" : netId;
}

function getLastUsedConnect() {
  return localStorage.getItem("last-used-connect") as
    | "temple"
    | "beacon"
    | null;
}

function setLastUsedConnect(val: "temple" | "beacon") {
  return localStorage.setItem("last-used-connect", val);
}

function cleanLastUsedConnect() {
  localStorage.removeItem("last-used-connect");
}
