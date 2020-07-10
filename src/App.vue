<template>
  <div id="app">
    <AppLayout class="pt-4 pb-12 relative px-4 xs:px-6">
      <div
        class="flex flex-row w-auto network-selector cursor-pointer justify-between  w-48 align-center absolute  top-40px left-0px"
        @click="handleSelectNetwork"
      >
        <span
          class="connect-button  button-network text-white w-48 h-12 border-2 border border-accent rounded-3px rounded-lg  flex items-center justify-center "
        >
          {{ getAllNetworks()[selectedNetwork] }}
        </span>
        <img
          :class="networkSelect ? ` z-10  right-0 transform rotate-180` : ` z-10  right-0`"
          src="@/assets/arrow-down.svg"
        />
      </div>
      <div class="flex flex-col w-48 justify-end absolute  top-100px " v-if="networkSelect">
        <span
          class="connect-button network-item cursor-pointer text-white w-48 h-12 my-1 border-2 border  border-accent rounded-3px rounded-lg flex items-center justify-center "
          v-for="network in getAvailableNetworks"
          :key="network"
          @click="setNetwork(network)"
          >{{ networks[network] }}</span
        >
      </div>
      <template v-if="!account.pkh.length">
        <button
          class="text-white w-56 h-12 border-2 border border-accent rounded-3px absolute right-0 top-40px right-40px hidden md:block"
          @click="handleConnect"
        >
          Connect to a Wallet
        </button>
      </template>
      <template v-if="account.pkh.length">
        <div class="flex flex-row w-auto justify-center absolute right-0 top-40px right-0px">
          <span
            class="connect-button button-balance  text-white w-32 h-12 px-2 border-2 border border-accent rounded-3px rounded-lg  flex items-center justify-center "
          >
            {{ `${account.balance.toFixed(1)} XTZ` }}
          </span>
          <div
            class="connect-button text-white button-pkh cursor-pointer w-64 h-12 border-2 border border-l-0 border-accent rounded-3px  flex items-center justify-center "
            @mouseover="action.setName = `Change account`"
            @mouseleave="action.setName = `${account.pkh.slice(0, 10)}...${account.pkh.slice(26)} `"
            @click="handleConnectForce"
          >
            <span>{{ action.name }}</span>
          </div>
        </div>
      </template>
      <img class="mx-auto mb-12" src="./assets/logo.png" />
      <router-view />
    </AppLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ThanosWallet } from "@thanos-wallet/dapp";
import AppLayout from "@/components/AppLayout.vue";
import { NETWORKS, useThanosWallet } from "@/taquito/tezos";
import store, { getAccount as getThanosAccount, setAccount, setNetwork, getNetwork } from "@/store";
import bus from "@/store/bus";

@Component({
  components: { AppLayout },
})
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getAllNetworks","getAvailableNetworks"] }] */
export default class App extends Vue {
  selectedNetwork: string | null = "main";
  networks: any = [];
  networkSelect: any = false;
  action = {
    name: "",
    set setName(name: string) {
      this.name = name;
    },
  };

  getAllNetworks() {
    return NETWORKS;
  }

  get getAvailableNetworks() {
    console.log(Object.keys(this.networks), NETWORKS);

    return Object.keys(this.networks).filter(network => network !== this.selectedNetwork);
  }

  handleSelectNetwork() {
    this.networkSelect = !this.networkSelect;
  }

  setNetwork(network: string) {
    this.selectedNetwork = network;
    this.networkSelect = false;
    setNetwork(network);
  }

  account: any = {
    pkh: "",
    balance: 0,

    set setPkh(pkh: string) {
      this.pkh = pkh;
    },

    set setBalance(balance: number) {
      this.balance = balance;
    },
  };

  mounted() {
    this.networks = NETWORKS;
    this.selectedNetwork = getNetwork() || Object.keys(NETWORKS)[0];
    this.action.setName = `${this.account.pkh.slice(0, 10)}...${this.account.pkh.slice(26)} `;
    bus.$on("refreshWallet", this.handleUseThanos);
  }

  created() {
    this.tokens();
    const account = getThanosAccount();
    if (Object.keys(account).length) {
      this.account.setPkh = account.pkh;
      this.account.setBalance = account.balance;
    }
  }

  tokens = () => {
    store.dispatch("tokens");
  };

  handleConnect = () => this.handleUseThanos();
  handleConnectForce = () => this.handleUseThanos(true);

  handleUseThanos = async (forcePermission: boolean = false) => {
    try {
      const available = await ThanosWallet.isAvailable();
      if (!available) {
        throw new Error("Thanos Wallet not installed");
      }

      const tezos = await useThanosWallet(forcePermission);

      const pkh = await tezos.wallet.pkh();
      const muBalance: any = await tezos.tz.getBalance(pkh);
      const balance = muBalance / 1000000;
      console.info(`address: ${pkh}, balance: ${balance}`);
      setAccount({ pkh, balance });
      this.account.setPkh = pkh;
      this.account.setBalance = balance;
      this.action.setName = `${this.account.pkh.slice(0, 10)}...${this.account.pkh.slice(26)} `;
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
button {
  outline: none;
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
.button-network {
  margin-right: -30px;
  z-index: 1;
}

.network-selector:hover {
  .button-network {
    background: rgb(42, 50, 92);
    transition-duration: 0.2s;
  }
}
.network-item:hover {
  background: rgb(42, 50, 92);
  transition-duration: 0.2s;
}
</style>
