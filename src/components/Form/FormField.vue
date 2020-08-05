<template>
  <div class="-mx-3 xs:-mx-4 shadow-lg">
    <div
      :class="
        isSearchOpened ? 'field rounded-t-3px' : ' field rounded-3px relative'
      "
    >
      <div class="py-6 flex-1 flex flex-col justify-start">
        <div class="label mb-1 xs:mb-2 sm:text-lg font-light w-full">{{ label }}</div>
        <input
          class="w-full"
          :class="!withSelect && isLoading && 'hidden'"
          v-bind="$attrs"
          v-on="$listeners"
        />
        <div v-if="!withSelect && isLoading" class="flex items-center" style="height: 30px">
          <Loader />
        </div>
        <div class="flex-1" />
        <div class="label sm:text-sm font-light w-full">{{ subLabel }}</div>
      </div>

      <div class="flex items-center">
        <div v-if="withSelect" class="append flex relative">
          <button
            @click="toggleSearch"
            class="flex text-white border-accent border-2 items-center rounded-3px py-2 px-3 text-sm sm:text-base whitespace-no-wrap flex-shrink-0 focus:outline-none"
          >
            <template v-if="!isLoading">
              <template v-if="localToken">
                <img class="w-5 h-5 mr-2" :src="localToken.imgUrl" />
                <span class="truncate">{{ formattedLocalTokenSymbol }}</span>
              </template>
              <span v-else>Select a token</span>
            </template>
            <template v-if="isLoading">
              <Loader />
            </template>
            <img
              class="w-3 ml-2"
              style="margin-top: -2px"
              src="@/assets/chevron-white.svg"
              v-if="!onlyTezos"
            />
          </button>

          <div
            v-if="!onlyTezos && selectedToken && selectedToken.type === 'token' && !isLoading"
            class="absolute w-full flex justify-center"
            style="top: 100%;"
          >
            <button
              class="p-1 text-xs text-accent font-light opacity-75 hover:underline hover:opacity-100 focus:outline-none whitespace-no-wrap"
              @click="() => copyToCB(this.selectedToken.id)"
            >Copy contract address</button>
          </div>
        </div>
      </div>
    </div>
    <div class="field-search rounded-b-3px" v-if="isSearchOpened && !onlyTezos">
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
        <div v-else class="text-center py-4 text-xl">Not Found...</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from "vue-property-decorator";
import TokenItem from "@/components/Form/TokenItem.vue";
import Loader from "@/components/Loader.vue";

import store from "@/store";
import { QSAsset, isAddressValid } from "@/core";
import { TEZOS_TOKEN } from "@/core/defaults";

@Component({
  components: { TokenItem, Loader },
})
export default class FormField extends Vue {
  @Prop() label?: string;
  @Prop() subLabel?: string;
  @Prop({ default: false }) isLoading?: boolean;
  @Prop({ default: true }) withSelect?: boolean;
  @Prop({ default: true }) showSearch?: boolean;
  @Prop({ default: true }) withTezos?: boolean;
  @Prop({ default: false }) onlyTezos?: boolean;
  @Prop({ default: null }) selectedToken?: QSAsset | null;
  @Ref("searchInput") readonly searchInput!: HTMLInputElement;

  value: string = "0.0";

  searchValue: string = "";
  isSearchOpened: boolean = false;
  localToken: QSAsset | null = null;

  get formattedLocalTokenSymbol() {
    if (!this.localToken) return "";
    const term = this.localToken.symbol;
    if (isAddressValid(term)) {
      const ln = term.length;
      return [term.slice(0, 7), "...", term.slice(ln - 4, ln)].join("");
    } else return term;
  }

  get filteredTokens(): QSAsset[] {
    return [
      ...(this.withTezos ? [TEZOS_TOKEN] : []),
      ...store.state.tokens.filter(
        (t: QSAsset) =>
          t.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
          t.symbol.toLowerCase().includes(this.searchValue.toLowerCase())
      ),
    ];
  }

  created() {
    if (this.onlyTezos) {
      this.localToken = TEZOS_TOKEN;
    } else if (this.selectedToken) {
      this.localToken = this.selectedToken;
    }
  }

  @Watch("selectedToken")
  onSelectedTokenChanged() {
    if (this.selectedToken !== undefined) {
      this.localToken = this.selectedToken;
    }
  }

  toggleSearch() {
    this.isSearchOpened = !this.isSearchOpened;
    this.$nextTick(
      () => this.isSearchOpened && !this.onlyTezos && this.searchInput.focus()
    );
  }

  selectToken(token: QSAsset) {
    this.searchValue = "";
    this.localToken = token;
    this.isSearchOpened = false;
    this.$emit("selectToken", token);
  }

  copyToCB(text: string) {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
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
  @apply px-3 flex items-stretch;
  min-height: 5rem;
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

.append {
}
</style>
