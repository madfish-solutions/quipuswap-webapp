import Vue from "vue";
import Vuex from "vuex";
import { getStorage } from "@/taquito/contracts/factory";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    tokens: [],
  },
  mutations: {
    tokens(state, tokens) {
      state.tokens = tokens;
    },
  },
  actions: {
    async tokens({ commit, state }, tokens) {
      const storage: any = await getStorage();
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
