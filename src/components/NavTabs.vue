<template>
  <div>
    <div class="h-10 nav-wrapper shadow-lg">
      <router-link class="nav-item" active-class="active" to="/swap">
        <span>Swap</span></router-link
      >
      <router-link class="nav-item" active-class="active" to="/send"
        ><span>Send</span></router-link
      >
      <router-link class="nav-item" active-class="active" to="/invest"
        ><span>Invest</span></router-link
      >
      <router-link class="nav-item" active-class="active" to="/governance"
        ><span>Govern</span></router-link
      >
    </div>

    <div v-if="infoBannerDisplayed" class="relative mt-6 mb-4 bg-accent rounded text-gray-800 flex items-center py-4 pl-4 pr-8">
      <img
        src="@/assets/danger.svg"
        style="width: 24px; height: 24px;"
      />

      <p class="ml-3 text-sm">
        Please, migrate your liquidity from QuipuSwap v1 to QuipuSwap v1.1 contracts. This upgrade is required and ensures correctness of the baking rewards and adds improvements to the voting system.
      </p>

      <!-- <button class="absolute top-0 right-0 p-2 focus:outline-none" @click="handleCloseInfoBanner">
        <img
          src="@/assets/close.svg"
          style="width: 16px; height: 16px;"
        />
      </button> -->
    </div>

    <a
      v-for="pool in v1_0pools"
      :key="pool.dexAddress"
      :href="pool.link"
      target="_blank"
      rel="noopener noreferrer"
      class="my-2 bg-darkblue rounded text-white flex items-center px-4 py-2 text-sm hover:bg-gray-800"
    >
      <img class="w-5 h-5 mr-1" src="@/assets/xtz.png" />
      <div class="mr-1 opacity-75">+</div>
      <img class="w-5 h-5 mr-3" :src="pool.underlineTokenMetadata.thumbnailUri" />
      <span class="mr-3">XTZ / {{ pool.underlineTokenMetadata.symbol }}</span>
      <span><span class="opacity-75">Shares:</span> <span class="font-semibold">{{ pool.balance }}</span></span>
      <div class="flex-1" />
      <div
        class="text-accent font-medium flex items-center group-hover:underline"
      >
        Migrate
        <img class="w-3 h-3 ml-1" src="@/assets/arrow-right-top.svg" />
      </div>
    </a>
  </div>
</template>

<script lang="ts">
import store from "@/store";
import { Vue, Component } from "vue-property-decorator";

const INFO_BANNER_LS_KEY = "info-banner";

function getInfoBannerDisplayed() {
  try {
    const val = localStorage.getItem(INFO_BANNER_LS_KEY);
    return val ? JSON.parse(val) : true;
  } catch (_err) {
    return true;
  }
}

@Component
export default class NavTabs extends Vue {
  infoBannerDisplayed = getInfoBannerDisplayed();

  get v1_0pools() {
    return store.state.v0Pools;
  }

  updateInfoBanner() {
    this.infoBannerDisplayed = getInfoBannerDisplayed();
  }

  handleCloseInfoBanner() {
    (async () => {
      try {
        await this.$confirm(
          "Are you sure you want to clean info banner?",
          "Confirm",
          "warning",
          {
            confirmButtonText: "Yes, clean",
          }
        );

        localStorage.setItem(INFO_BANNER_LS_KEY, "false");
        this.updateInfoBanner();
      } catch (_err) {
        return;
      }
    })();
  }
}
</script>

<style lang="postcss" scoped>
.nav-wrapper {
  @apply flex text-white rounded-3px;
  background: #37415f;
  /* background: rgba(55, 65, 95, 0.4); */
  overflow: hidden;
}

.nav-item {
  @apply h-full w-1/3 flex items-center justify-center bg-transparent rounded-3px;
  transition: all ease 0.35s;
}

.nav-item span {
  @apply leading-none;
}

.nav-item.active {
  @apply font-semibold opacity-90;
  background: #5b61f6;
}

.nav-item span {
  @apply opacity-90;
}

.nav-item.active span {
  @apply opacity-100;
}
</style>
