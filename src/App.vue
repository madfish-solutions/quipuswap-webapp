<template>
  <div id="app" class="flex flex-col">
    <div class="container mx-auto py-4 px-4 xs:px-6 relative">
      <header class="mb-12 flex items-stretch">
        <div class="flex-1 flex justify-start pt-4">
          <div class="select-none hidden lg:block">
            <div
              class="flex flex-row w-auto network-selector cursor-pointer justify-between align-center"
              @click="toggleNetworkSelect"
            >
              <span
                class="connect-button button-network text-white w-48 h-12 border border-accent rounded-lg flex items-center justify-center"
              >{{ selectedNetwork.name }}</span>

              <img
                :class="
            networkSelectOpened
              ? 'z-10 transform rotate-180'
              : 'z-10'
          "
                src="@/assets/arrow-down.svg"
              />
            </div>

            <div
              class="flex flex-col w-48 justify-end absolute top-100px"
              v-if="networkSelectOpened"
            >
              <button
                class="connect-button network-item cursor-pointer text-white w-48 h-12 my-1 border border-accent rounded-lg flex items-center justify-center"
                :class="net.disabled ? 'opacity-50' : ''"
                v-for="net in allNetworks"
                :key="net.id"
                @click="() => selectNetwork(net)"
                :disabled="net.disabled"
              >{{ net.name }}</button>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center">
          <router-link to="/">
            <h1 class="text-xl text-gray-300 font-medium tracking-tight">Quipuswap</h1>
          </router-link>

          <img class="h-32 w-auto" src="./assets/logo.png" />
        </div>

        <div class="flex-1 flex justify-end pt-4">
          <div class="hidden lg:block">
            <template v-if="!account.pkh">
              <button
                class="text-white w-64 h-12 border border-accent rounded-md"
                @click="handleConnect"
              >Connect to a Wallet</button>
            </template>

            <template v-else>
              <div class="flex flex-row w-auto justify-center">
                <span
                  class="connect-button button-balance text-white h-12 px-4 border border-accent rounded-lg flex items-center justify-center"
                >
                  <span v-if="accountBalance">{{ accountBalance }} XTZ</span>
                  <div v-else class="flex items-center justify-center">
                    <Loader />
                  </div>
                </span>

                <div
                  class="connect-button text-white button-pkh cursor-pointer w-64 px-4 h-12 border border-l-0 border-accent rounded-md flex items-center justify-center"
                  @mouseover="accountLabelHovered = true"
                  @mouseleave="accountLabelHovered = false"
                  @click="handleConnectForce"
                >
                  <span>{{ accountLabel }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </header>

      <!--
      <div
        class="flex flex-row w-auto network-selector cursor-pointer justify-between align-center absolute top-40px left-0px"
        @click="toggleNetworkSelect"
      >
        <span
          class="connect-button button-network text-white w-48 h-12 border border-accent rounded-lg flex items-center justify-center"
        >{{ selectedNetwork.name }}</span>
        <img
          :class="
            networkSelectOpened
              ? 'z-10 right-0 transform rotate-180'
              : 'z-10 right-0'
          "
          src="@/assets/arrow-down.svg"
        />
      </div>
      <div class="flex flex-col w-48 justify-end absolute top-100px" v-if="networkSelectOpened">
        <button
          class="connect-button network-item cursor-pointer text-white w-48 h-12 my-1 border border-accent rounded-lg flex items-center justify-center"
          :class="net.disabled ? 'opacity-50' : ''"
          v-for="net in allNetworks"
          :key="net.id"
          @click="() => selectNetwork(net)"
          :disabled="net.disabled"
        >{{ net.name }}</button>
      </div>

      <template v-if="!account.pkh">
        <button
          class="text-white w-56 h-12 border border-accent rounded-3px absolute top-40px right-40px hidden md:block"
          @click="handleConnect"
        >Connect to a Wallet</button>
      </template>

      <template v-else>
        <div class="flex flex-row w-auto justify-center absolute right-0 top-40px right-0px">
          <span
            class="connect-button button-balance text-white w-32 h-12 px-2 border border-accent rounded-lg flex items-center justify-center"
          >
            <span v-if="accountBalance">{{ accountBalance }} XTZ</span>
            <div v-else class="flex items-center justify-center">
              <Loader />
            </div>
          </span>

          <div
            class="connect-button text-white button-pkh cursor-pointer w-64 h-12 border border-l-0 border-accent rounded-3px flex items-center justify-center"
            @mouseover="accountLabelHovered = true"
            @mouseleave="accountLabelHovered = false"
            @click="handleConnectForce"
          >
            <span>{{ accountLabel }}</span>
          </div>
        </div>
      </template>

      <img class="mx-auto mb-12" src="./assets/logo.png" />-->

      <router-view />
    </div>

    <div class="flex-1"></div>

    <div class="mt-10 p-4 flex items-center justify-center">
      <span class="text-sm font-light text-white">
        Made with
        <span role="img" aria-label="Madfish Solutions">❤️</span> by
        <a
          href="https://madfish.solutions"
          target="_blank"
          rel="noopener noreferrer"
          class="font-normal hover:underline"
          style="color: #98c630;"
        >Madfish.Solutions</a>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { ThanosWallet } from "@thanos-wallet/dapp";
import Loader from "@/components/Loader.vue";
import {
  ALL_NETWORKS,
  XTZ_TOKEN,
  QSNetwork,
  getBalance,
  getNetwork,
  setNetwork,
} from "@/core";
import { getAccount, setAccount, useThanosWallet } from "@/store";

@Component({
  components: { Loader },
})
export default class App extends Vue {
  networkSelectOpened = false;
  selectedNetwork = getNetwork();

  accountBalance: string | null = null;
  accountLabelHovered = false;

  get allNetworks() {
    return ALL_NETWORKS;
  }

  get account() {
    return getAccount();
  }

  get accountLabel() {
    if (this.accountLabelHovered) return `Change account`;
    if (!this.account.pkh) return "";

    const ln = this.account.pkh.length;
    return [
      this.account.pkh.slice(0, 9),
      "...",
      this.account.pkh.slice(ln - 7, ln),
    ].join("");
  }

  created() {
    this.loadAccBalance();
  }

  @Watch("account")
  onAccountChange() {
    this.loadAccBalance();
  }

  async loadAccBalance() {
    this.accountBalance = null;
    if (this.account.pkh) {
      const bal = await getBalance(this.account.pkh, XTZ_TOKEN);
      this.accountBalance = bal.toFormat(2);
    }
  }

  toggleNetworkSelect() {
    this.networkSelectOpened = !this.networkSelectOpened;
  }

  selectNetwork(net: QSNetwork) {
    if (net.disabled) return;

    this.networkSelectOpened = false;
    this.selectedNetwork = net;

    if (getNetwork().id !== net.id) {
      setNetwork(net);
    }
  }

  handleConnect() {
    this.connectWallet();
  }
  handleConnectForce() {
    this.connectWallet(true);
  }

  connectWallet = async (forcePermission = false) => {
    try {
      const available = await ThanosWallet.isAvailable();
      if (!available) {
        throw new Error("Thanos Wallet not installed");
      }

      await useThanosWallet({ forcePermission });
    } catch (err) {
      console.error(err);
    }
  };
}
</script>

<style lang="scss">
html {
  background-color: #151a28;
  background-image: linear-gradient(203.07deg, #151a28 21.27%, #242f4e 92.17%);
  background-repeat: no-repeat;
}

html,
body,
#app {
  min-height: 100vh;
}

button {
  outline: none;
}

#app {
  background: url("assets/lines.png") 100%;
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
