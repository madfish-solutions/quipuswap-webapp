import Vue from "vue";
import Vuex from "vuex";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TempleWallet } from "@temple-wallet/dapp";
import {
  QSAsset,
  getTokens,
  getNetwork,
  getCustomTokens,
  LOGO_URL,
  ReadOnlySigner,
  michelEncoder,
} from "@/core";
import { TezosToolkit } from "@taquito/taquito";

Vue.use(Vuex);

interface StoreState {
  tokensLoading: boolean;
  tokens: QSAsset[];
  account: { pkh: string };
}

const store = new Vuex.Store<StoreState>({
  state: {
    tokensLoading: false,
    tokens: [],
    account: getAccountInitial(),
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
  },
});

export default store;

loadTokens();

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

export function addCustomToken(token: QSAsset) {
  try {
    const current = getCustomTokens();
    const net = getNetwork();
    localStorage.setItem(
      `custom_tokens_${net.id}`,
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
      throw new Error("There no connect type");
    }

    connectType = last;
  }

  return connectType === "temple"
    ? useWalletTemple(forcePermission)
    : useWalletBeacon(forcePermission);
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

  const wallet = new TempleWallet("Quipuswap", perm);

  if (!wallet.connected) {
    await wallet.connect(net.id as any, { forcePermission: true });
  }

  const tezos = wallet.toTezos();
  tezos.setPackerProvider(michelEncoder);
  const { pkh, publicKey } = wallet.permission!;
  tezos.setSignerProvider(new ReadOnlySigner(pkh, publicKey));
  if (getAccount().pkh !== pkh) {
    setAccount(pkh);
  }
  setLastUsedConnect("temple");
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
      network: { type: toBeaconNetworkType(net.id) },
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
  if (getAccount().pkh !== activeAcc.address) {
    setAccount(activeAcc.address);
  }
  setLastUsedConnect("beacon");
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
