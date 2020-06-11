import Vue from "vue";
import Vuex from "vuex";
import { getStorage } from "@/taquito/contracts/factory";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    tokens: [],
    account: { balance: 0, pkh: "" },
    tokensStorage: {} as any,
  },
  mutations: {
    tokens(state, tokens) {
      state.tokens = tokens;
    },
    tokensStorage(state, storage) {
      state.tokensStorage = { ...state.tokensStorage, [storage.key]: storage.value };
    },
    account(state, account) {
      state.account = account;
    },
  },
  actions: {
    async tokens({ commit, state }) {
      const storage: any = await getStorage().catch(e => console.error(e));
      const tokenList = storage.tokenList.map((token: any) => ({
        id: token,
        name: "Token",
        type: "token",
        symbol: token,
        exchange: storage.tokenToExchange.get(token),
        imgUrl:
          "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
      }));
      commit("tokens", tokenList);
    },
  },
  modules: {},
});

export function setAccount(account: object) {
  localStorage.setItem("account", JSON.stringify(account));
}

export function getAccount() {
  const account: any = localStorage.getItem("account");
  return JSON.parse(account) || {};
}

export function setNetwork(network: string) {
  localStorage.setItem("network", network);
}

export function getNetwork() {
  const network: string = localStorage.getItem("network") || "mainnet";
  return network;
}
