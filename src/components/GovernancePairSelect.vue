<template>
  <div class="-mx-3 xs:-mx-4 shadow-lg">
    <div :class="isSearchOpened ? 'field rounded-t-3px' : ' field rounded-3px relative'">
      <div class="flex-1 flex flex-col justify-center">
        <div class="label mb-1 xs:mb-2 sm:text-lg font-light w-full">{{ label }}</div>
        <input class="w-full" v-bind="$attrs" v-on="$listeners" />
        <div class="label sm:text-sm font-light w-full">{{ subLabel }}</div>
      </div>

      <div class="append flex">
        <button
          @click="toggleSearch"
          class="flex text-white border-accent border-2 items-center rounded-3px py-2 px-3 text-sm sm:text-base whitespace-no-wrap flex-shrink-0"
        >
          <template v-if="!isLoading">
            <template v-if="selectedToken">
              <img class="w-5 h-5 mr-2" :src="selectedToken.imgUrl" />
              <span class="truncate">{{ selectedToken.symbol }}</span>
            </template>
            <span v-else>Select a token</span>
          </template>
          <template v-if="isLoading">
            <Loader />
          </template>
          <img class="w-3 ml-2" style="margin-top: -2px" src="@/assets/chevron-white.svg" />
        </button>
      </div>
    </div>

    <div class="field-search rounded-b-3px" v-if="isSearchOpened">
      <div class="px-3 xs:px-6 py-3 text-sm">
        <input
          v-model="searchValue"
          @keydown="searchValue = $event.target.value"
          ref="searchInput"
          placeholder="Search..."
        />
      </div>
      <div class="overflow-auto" style="max-height: 200px">
        <template v-if="filteredTokens.length">
          <TokenItem
            v-for="token in filteredTokens"
            :key="token.id"
            :symbol="token.symbol"
            :name="token.name"
            class="token-item"
            @click.native="selectToken(token)"
          />
        </template>
        <div v-else class="text-center py-4 text-xl">Not Found...</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref } from "vue-property-decorator";
import { ITokenItem } from "@/api/getTokens";
import store from "@/store";
import TokenItem from "@/components/Form/TokenItem.vue";
import Loader from "@/components/Loader.vue";

@Component({
  components: { TokenItem, Loader },
})
export default class GovernancePairSelect extends Vue {
  @Ref("searchInput") readonly searchInput!: HTMLInputElement;

  label: string = "Select Token";
  subLabel: string = "Kek";

  searchValue: string = "";
  isSearchOpened: boolean = true;
  selectedToken: ITokenItem | null = null;
  isLoading: boolean = false;

  get filteredTokens(): ITokenItem[] {
    return store.state.tokens.filter(
      (t: ITokenItem) =>
        t.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        t.symbol.toLowerCase().includes(this.searchValue.toLowerCase())
    );
  }

  toggleSearch() {
    this.isSearchOpened = !this.isSearchOpened;
    this.$nextTick(() => this.isSearchOpened && this.searchInput.focus());
  }

  selectToken(token: ITokenItem) {
    this.searchValue = "";
    this.selectedToken = token;
    this.isSearchOpened = false;
    this.$emit("selectToken", token);
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
  @apply h-20 px-3 flex items-center;
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
    @apply px-6 h-32;
  }

  .field-extend {
    @apply px-6 h-32;
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
