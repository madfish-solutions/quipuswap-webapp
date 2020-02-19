<template>
  <div class="-mx-4 shadow-lg">
    <div class="field" :class="isSearchOpened ? 'rounded-t-3px' : 'rounded-3px'">
      <div class="flex-1 flex flex-col jutify-center">
        <div class="label mb-2 text-lg font-light">{{ label }}</div>
        <input placeholder="0.0" :value="value" />
      </div>
      <div class="append">
        <button
          @click="toggleSearch"
          class="flex text-white border-accent border-2 items-center rounded-3px py-2 px-3"
        >
          <template v-if="selectedToken">
            <img class="w-5 h-5 mr-2" :src="selectedToken.imgUrl" />
            {{ selectedToken.symbol }}
          </template>
          <span v-else>Select a token</span>
          <img class="w-3 ml-2" style="margin-top: -2px" src="@/assets/chevron-white.svg" />
        </button>
      </div>
    </div>
    <div class="field-search rounded-b-3px" v-if="isSearchOpened">
      <div class="px-6 py-3">
        <input v-model="searchValue" ref="searchInput" placeholder="Search..." />
      </div>
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
      <div v-else class="text-center py-4 text-xl">
        Not Found...
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from "vue-property-decorator";
import getTokens, { ITokenItem } from "@/api/getTokens";
import TokenItem from "./TokenItem.vue";

@Component({
  components: { TokenItem },
})
export default class FieldInput extends Vue {
  @Prop() label?: string;
  @Ref("searchInput") readonly searchInput!: HTMLInputElement;

  value: string = "0.0";

  searchValue: string = "";
  isSearchOpened: boolean = false;
  selectedToken: ITokenItem | null = null;
  tokens: ITokenItem[] = [];

  get filteredTokens(): ITokenItem[] {
    return this.tokens.filter(
      t => t.name.includes(this.searchValue) || t.symbol.includes(this.searchValue)
    );
  }

  async mounted() {
    const tokens = await getTokens();
    this.tokens = tokens;
  }

  toggleSearch() {
    this.isSearchOpened = !this.isSearchOpened;
    this.$nextTick(() => this.isSearchOpened && this.searchInput.focus());
  }

  selectToken(token: ITokenItem) {
    this.searchValue = "";
    this.selectedToken = token;
    this.isSearchOpened = false;
  }
}
</script>

<style lang="postcss" scoped>
.token-item {
  @apply bg-transparent px-6 py-2 transition duration-300 cursor-pointer;
}

.token-item:hover {
  @apply bg-gray-900;
}

.field {
  @apply h-24 px-6 flex items-center;
  background: #2a3248;
}

.field-search {
  @apply w-full overflow-hidden;
  background: #242b41;
}

.label {
  color: #f6cc5b;
}

input {
  @apply bg-transparent outline-none text-xl font-light;
}

.append {
}
</style>
