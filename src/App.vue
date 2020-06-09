<template>
  <div id="app">
    <AppLayout class="pt-4 pb-12 relative px-4 xs:px-6">
      <template v-if="!Object.keys(account).length">
        <button
          class="text-white w-56 h-12 border-2 border border-accent rounded-3px absolute right-0 top-40px right-40px hidden md:block"
          @click="handleUseThanos"
        >
          Connect to a Wallet
        </button>
      </template>
      <template v-if="Object.keys(account).length">
        <div class="flex flex-row w-auto justify-center absolute right-0 top-40px right-0px">
          <span
            class="connect-button button-balance  text-white w-24 h-12 border-2 border border-accent rounded-3px rounded-lg  flex items-center justify-center "
          >
            {{ `${(account.balance / 1000000).toFixed(1)} XTZ` }}
          </span>
          <span
            class="connect-button text-white w-64 h-12 border-2 border border-l-0 border-accent rounded-3px  flex items-center justify-center "
          >
            {{ `${account.pkh.slice(0, 10)}...${account.pkh.slice(26)} ` }}
          </span>
        </div>
      </template>
      <img class="mx-auto mb-12" src="./assets/logo.png" />
      <router-view />
    </AppLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { ThanosWallet } from "@thanos-wallet/dapp";
import AppLayout from "@/components/AppLayout.vue";
import store from "@/store";

@Component({
  components: { AppLayout },
})
export default class App extends Vue {
  account: object = {};
  created() {
    this.tokens();
  }
  /*  eslint class-methods-use-this: ["error", { "exceptMethods": ["getAccount"] }] */

  get getAccount() {
    return store.state.account;
  }

  @Watch("getAccount")
  changeAccount(account: object) {
    this.account = account;
  }

  tokens = () => {
    store.dispatch("tokens");
  };

  handleUseThanos = async () => {
    try {
      const available = await ThanosWallet.isAvailable();
      if (!available) {
        throw new Error("Thanos Wallet not installed");
      }

      const wallet = new ThanosWallet("Quipuswap");
      await wallet.connect("carthagenet");
      const tezos = wallet.toTezos();

      const pkh = await tezos.wallet.pkh();
      const balance = await tezos.tz.getBalance(pkh);
      console.info(`address: ${pkh}, balance: ${balance}`);
      store.commit("account", { pkh, balance });
    } catch (err) {
      console.error(err);
    }
  };
}
</script>

<style lang="scss">
html,
body {
  height: 100%;
}

#app {
  min-height: 100%;
  background: url("assets/lines.png") 100%, url("assets/gradient.png");
  background-size: 100%, cover;
  background-position: 0 0, 50%;
  font-family: "Roboto", sans-serif;
}
.connect-button {
  background: #242b41;
}
.button-balance {
  margin-right: -10px;
  z-index: 1;
}
</style>
