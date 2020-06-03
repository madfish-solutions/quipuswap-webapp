import Vue from "vue";
import Vuex from "vuex";
import { getStorage } from "@/taquito/contracts/factory";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    tokens: [],
    accountPublicKeyHash: "tz1bQEJqMqC92ommfsRB6pWG9LVBKNgXPysh",
    tokensStorage: {} as any,
  },
  mutations: {
    tokens(state, tokens) {
      state.tokens = tokens;
    },
    tokensStorage(state, storage) {
      state.tokensStorage = { ...state.tokensStorage, [storage.key]: storage.value };
    },
  },
  actions: {
    async tokens({ commit, state }, tokens) {
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
