import Vue from "vue";
import Vuex from "vuex";
import { ThanosWallet } from "@thanos-wallet/dapp";
import { QSAsset, getTokens, getNetwork } from "@/core";

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

export async function useThanosWallet(opts = { forcePermission: false }) {
  const available = await ThanosWallet.isAvailable();
  if (!available) {
    throw new Error("Thanos Wallet not installed");
  }

  const wallet = new ThanosWallet("Quipuswap");
  await wallet.connect(getNetwork().id, opts);
  const tezos = wallet.toTezos();
  const pkh = await tezos.wallet.pkh();
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
