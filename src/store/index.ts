import Vue from "vue";
import Vuex from "vuex";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { QSAsset, getTokens, getNetwork, LOGO_URL } from "@/core";
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

export async function useWallet(opts = { forcePermission: false }) {
  const net = getNetwork();
  const wallet = new BeaconWallet({
    name: "Quipuswap",
    iconUrl: LOGO_URL,
    // eventHandlers: {
    //   PERMISSION_REQUEST_SUCCESS: {
    //     handler: async data => {
    //       console.log("permission data:", data);
    //     },
    //   },
    // },
  });

  if (opts.forcePermission) {
    await wallet.disconnect();
    await wallet.clearActiveAccount();
  }

  const activeAccount = await wallet.client.getActiveAccount();

  if (!activeAccount || activeAccount.network.type !== net.id) {
    await wallet.requestPermissions({ network: { type: net.id as any } });
  }

  const tezos = new TezosToolkit(net.rpcBaseURL);
  tezos.setWalletProvider(wallet);
  tezos.setSignerProvider({
    async publicKeyHash() {
      const acc = await wallet.client.getActiveAccount();
      if (!acc) throw new Error("Not connected");
      return acc.address;
    },
    async publicKey() {
      const acc = await wallet.client.getActiveAccount();
      if (!acc) throw new Error("Not connected");
      return acc.publicKey;
    },
    async secretKey(): Promise<string> {
      throw new Error("Secret key cannot be exposed");
    },
    async sign() {
      throw new Error("Cannot sign");
    },
  });
  const pkh = await wallet.getPKH();

  if (getAccount().pkh !== pkh) {
    setAccount(pkh);
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

function getAccountInitial() {
  const pkh = localStorage.getItem("accpkh");
  return { pkh: pkh || "" };
}
