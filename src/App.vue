<template>
  <div id="app" class="flex flex-col">
    <div class="container relative px-4 py-4 mx-auto xs:px-6">
      <header class="flex items-stretch mb-12">
        <div class="flex justify-start flex-1 pt-4">
          <div class="hidden select-none lg:block">
            <div
              class="flex flex-row justify-between w-auto cursor-pointer network-selector align-center"
              @click="toggleNetworkSelect"
            >
              <span
                class="flex items-center justify-center w-48 h-12 text-white border rounded-lg connect-button button-network border-accent"
                >{{ selectedNetwork.name }}</span
              >

              <img
                :class="
                  networkSelectOpened ? 'z-10 transform rotate-180' : 'z-10'
                "
                src="@/assets/arrow-down.svg"
              />
            </div>

            <div
              class="absolute flex flex-col justify-end w-48 top-100px"
              v-if="networkSelectOpened"
            >
              <button
                class="flex items-center justify-center w-48 h-12 my-1 text-white border rounded-lg cursor-pointer connect-button network-item border-accent"
                :class="net.disabled ? 'opacity-50' : ''"
                v-for="net in allNetworks"
                :key="net.id"
                @click="() => selectNetwork(net)"
                :disabled="net.disabled"
              >
                {{ net.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center">
          <router-link to="/">
            <h1 class="text-xl font-medium tracking-tight text-gray-300">
              Quipuswap
            </h1>
          </router-link>

          <img class="w-auto h-32" src="./assets/logo.png" />
        </div>

        <div class="flex justify-end flex-1 pt-4">
          <div class="hidden lg:block">
            <template v-if="!account.pkh">
              <button
                class="w-64 h-12 text-white border rounded-md border-accent"
                @click="handleConnectForce"
              >
                Connect to a Wallet
              </button>
            </template>

            <template v-else>
              <div class="flex flex-row justify-center w-auto">
                <span
                  class="flex items-center justify-center h-12 px-4 text-white border rounded-lg connect-button button-balance border-accent"
                >
                  <span v-if="accountBalance">{{ accountBalance }} XTZ</span>
                  <div v-else class="flex items-center justify-center">
                    <Loader />
                  </div>
                </span>

                <div
                  class="flex items-center justify-center w-64 h-12 px-4 text-white border border-l-0 rounded-md cursor-pointer connect-button button-pkh border-accent"
                  @mouseover="accountLabelHovered = true"
                  @mouseleave="accountLabelHovered = false"
                  @click="handleConnectForce"
                >
                  <span>{{ accountLabel }}</span>
                </div>
              </div>
            </template>

            <div v-if="account.pkh" class="flex items-center mt-3">
              <div class="flex-1"></div>
              <button class="flex items-center justify-center h-8 px-4 text-white border rounded-md cursor-pointer connect-button border-accent hover:text-accent" @click="logout">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <!--
      <div
        class="absolute flex flex-row justify-between w-auto cursor-pointer network-selector align-center top-40px left-0px"
        @click="toggleNetworkSelect"
      >
        <span
          class="flex items-center justify-center w-48 h-12 text-white border rounded-lg connect-button button-network border-accent"
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
      <div class="absolute flex flex-col justify-end w-48 top-100px" v-if="networkSelectOpened">
        <button
          class="flex items-center justify-center w-48 h-12 my-1 text-white border rounded-lg cursor-pointer connect-button network-item border-accent"
          :class="net.disabled ? 'opacity-50' : ''"
          v-for="net in allNetworks"
          :key="net.id"
          @click="() => selectNetwork(net)"
          :disabled="net.disabled"
        >{{ net.name }}</button>
      </div>

      <template v-if="!account.pkh">
        <button
          class="absolute hidden w-56 h-12 text-white border border-accent rounded-3px top-40px right-40px md:block"
          @click="handleConnect"
        >Connect to a Wallet</button>
      </template>

      <template v-else>
        <div class="absolute right-0 flex flex-row justify-center w-auto top-40px right-0px">
          <span
            class="flex items-center justify-center w-32 h-12 px-2 text-white border rounded-lg connect-button button-balance border-accent"
          >
            <span v-if="accountBalance">{{ accountBalance }} XTZ</span>
            <div v-else class="flex items-center justify-center">
              <Loader />
            </div>
          </span>

          <div
            class="flex items-center justify-center w-64 h-12 text-white border border-l-0 cursor-pointer connect-button button-pkh border-accent rounded-3px"
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

    <div class="flex flex-col items-center justify-center p-4 mt-10">
      <div class="p-4 text-sm font-light text-white">
        <a href="https://twitter.com/madfishofficial" class="px-4">
          Twitter
        </a>
        |
        <a href="https://t.me/MadFishCommunity" class="px-4">
          Telegram
        </a>
        |
        <a href="https://www.madfish.solutions/discord" class="px-4">
          Discord
        </a>
        |
        <a href="https://www.reddit.com/r/MadFishCommunity" class="px-4">
          Reddit
        </a>
      </div>
      <span class="text-sm font-light text-white">
        Made with
        <span role="img" aria-label="Madfish Solutions">❤️</span> by
        <a
          href="https://madfish.solutions"
          target="_blank"
          rel="noopener noreferrer"
          class="font-normal hover:underline"
          style="color: #98c630"
          >Madfish.Solutions</a
        >
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Loader from "@/components/Loader.vue";
import {
  ALL_NETWORKS,
  XTZ_TOKEN,
  QSNetwork,
  getBalance,
  getNetwork,
  setNetwork,
} from "@/core";
import { getAccount, signout, useWallet } from "@/store";

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

  logout() {
    signout();
  }

  connectWallet = async (forcePermission = false) => {
    try {
      await useWallet({ forcePermission });
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
