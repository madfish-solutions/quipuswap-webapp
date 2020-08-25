<template>
  <div class="mb-4 text-white -mx-3 xs:-mx-4 shadow-lg">
    <button
      class="relative field rounded-t-3px flex items-stretch text-left focus:outline-none"
      :class="isSearchOpened ? '' : 'rounded-b-3px'"
      @click="toggleSearch"
    >
      <div class="flex flex-col max-w-full overflow-x-auto">
        <div class="label mb-1 sm:text-lg font-light w-full">{{ label }}</div>

        <div class="w-full">
          <template v-if="selectedToken">
            <div class="flex items-center">
              <img class="w-5 h-5 mr-2" :src="selectedToken.imgUrl" />
              <span class="truncate">{{ formattedSelectedTokenSymbol }}</span>
            </div>

            <div class="mt-1 text-sm text-gray-500 font-light whitespace-no-wrap">
              <span class="mr-1">Dex contract:</span>
              <span class="font-mono text-gray-400">{{ selectedToken.exchange }}</span>
            </div>
          </template>
          <span v-if="!selectedToken">-</span>
        </div>
      </div>

      <div class="flex-1" />

      <img class="w-3 ml-2" style="margin-top: -2px" src="@/assets/chevron-white.svg" />
    </button>

    <div class="field-search rounded-b-3px" v-if="isSearchOpened">
      <div class="px-3 xs:px-6 py-3 text-sm border-b border-gray-800">
        <input
          v-model="searchValue"
          @keydown="searchValue = $event.target.value"
          ref="searchInput"
          placeholder="Search..."
        />
      </div>
      <div class="overflow-auto" style="max-height: 13.5rem">
        <template v-if="filteredTokens.length">
          <TokenItem
            v-for="token in filteredTokens"
            :key="token.id"
            :token="token"
            :symbol="token.symbol"
            :name="token.name"
            class="token-item"
            @click.native="selectToken(token)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from "vue-property-decorator";
import TokenItem from "@/components/Form/TokenItem.vue";
import Loader from "@/components/Loader.vue";

import { QSAsset, isAddressValid } from "@/core";
import store from "@/store";

@Component({
  components: { TokenItem, Loader },
})
export default class GovernancePairSelect extends Vue {
  @Prop({ default: null }) selectedToken?: QSAsset | null;
  @Ref("searchInput") readonly searchInput!: HTMLInputElement;

  label: string = "Select Token";

  searchValue: string = "";
  isSearchOpened: boolean = !Boolean(this.selectedToken);
  isLoading: boolean = false;

  @Watch("selectedToken")
  onSelectedTokenChanged() {
    if (this.selectedToken) {
      this.isSearchOpened = false;
    }
  }

  get formattedSelectedTokenSymbol() {
    if (!this.selectedToken) return "";
    const term = this.selectedToken.symbol;
    if (isAddressValid(term)) {
      const ln = term.length;
      return [term.slice(0, 7), "...", term.slice(ln - 4, ln)].join("");
    } else return term;
  }

  get filteredTokens(): QSAsset[] {
    return store.state.tokens.filter(
      (t: QSAsset) =>
        t.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        t.symbol.toLowerCase().includes(this.searchValue.toLowerCase())
    );
  }

  toggleSearch() {
    if (this.selectedToken) {
      this.isSearchOpened = !this.isSearchOpened;
      this.$nextTick(() => this.isSearchOpened && this.searchInput.focus());
    }
  }

  selectToken(token: QSAsset) {
    this.searchValue = "";
    if (!this.selectedToken || this.selectedToken.exchange !== token.exchange) {
      this.$emit("token-selected", token);
    } else {
      this.isSearchOpened = false;
    }
  }
}
</script>

<style lang="postcss" scoped>
.token-item {
  @apply bg-transparent px-3 py-1 transition duration-300 cursor-pointer;
}

.token-item:hover {
  @apply bg-gray-900;
}

.field {
  @apply w-full h-24 px-3 flex items-center;
  background: #2a3248;
}

.field-search {
  @apply w-full;
  background: #242b41;
}

input {
  @apply bg-transparent outline-none text-base font-light;
}

@screen xs {
  .field {
    @apply px-6 h-24;
  }

  .token-item {
    @apply px-6 py-2;
  }

  input {
    @apply text-xl;
  }
}

.label {
  color: #f6cc5b;
}
</style>
