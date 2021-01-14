<template>
  <div class="-mx-3 xs:-mx-4 shadow-lg">
    <div
      :class="
        isSearchOpened ? 'field rounded-t-3px' : ' field rounded-3px relative'
      "
    >
      <div class="flex-1 flex flex-col justify-center">
        <div class="label mb-1 xs:mb-2 sm:text-lg font-light w-full">
          {{ label }}
        </div>
        <input
          class="w-full"
          :class="!withSelect && isLoading && 'hidden'"
          :value="value"
          v-bind="$attrs"
          v-on="$listeners"
        />
        <div
          v-if="!withSelect && isLoading"
          class="flex items-center"
          style="height: 30px"
        >
          <Loader />
        </div>
        <div class="label sm:text-sm font-light w-full">{{ subLabel }}</div>
      </div>

      <div v-if="withSelect" class="append flex">
        <button
          @click="toggleSearch"
          class="ml-2 flex text-white border-accent border-2 items-center rounded-3px py-2 px-3 text-sm sm:text-base whitespace-no-wrap flex-shrink-0"
        >
          <template v-if="!isLoading">
            <template v-if="selectedBaker">
              <img
                class="w-5 h-5 mr-2 bg-white rounded-3px"
                :src="selectedBaker.logo"
              />
              <span class="truncate">{{ selectedBaker.name }}</span>
            </template>
            <span v-else>Select a baker</span>
          </template>
          <template v-if="isLoading">
            <Loader />
          </template>
          <img
            class="w-3 ml-2"
            style="margin-top: -2px"
            src="@/assets/chevron-white.svg"
          />
        </button>
      </div>
    </div>
    <div class="field-search rounded-b-3px" v-if="isSearchOpened">
      <div class="px-3 xs:px-6 py-3 text-sm border-b border-gray-800">
        <input
          v-model="searchValue"
          @keydown="searchValue = $event.target.value"
          ref="searchInput"
          placeholder="Search..."
        />
      </div>
      <div class="overflow-auto" style="max-height: 12.5rem">
        <template v-if="allKnownBakers.length > 0">
          <button
            v-for="baker in allKnownBakers"
            :key="baker.address"
            class="w-full flex items-center px-6 py-2 focus:outline-none text-left hover:bg-gray-900 transition duration-200 ease-in-out"
            v-on:click="selectBaker(baker)"
          >
            <div class="flex-1">
              <div class="flex items-stretch">
                <img
                  class="w-8 h-8 xs:w-10 xs:h-10 mr-3 bg-white rounded-3px"
                  :src="baker.logo"
                />
                <div class="flex-1 flex flex-col">
                  <div class="text-sm xs:text-base text-gray-300">
                    {{ baker.name }}
                  </div>
                  <div class="flex-1 flex items-center text-gray-400 text-xs">
                    <span class="mr-1">
                      <span class="font-light">Fee:</span>
                      {{ baker.fee * 100 }}%
                    </span>
                    <span>
                      <span class="font-light">Space:</span>
                      {{ Math.floor(baker.freeSpace) }} XTZ
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>-</div>
          </button>
        </template>
        <div v-else class="text-center py-4 text-xl">Not Found...</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from "vue-property-decorator";
import { getAllKnownBakersMemoized, BBKnownBaker } from "@/baking-bad";
import Loader from "@/components/Loader.vue";

@Component({
  components: { Loader },
})
export default class BakerFormField extends Vue {
  @Prop({ default: null }) selectedBaker?: BBKnownBaker | null;
  @Prop() label?: string;
  @Prop() subLabel?: string;
  @Prop() value?: string;
  @Prop({ default: false }) isLoading?: boolean;
  @Prop({ default: true }) withSelect?: boolean;
  @Prop({ default: true }) showSearch?: boolean;
  @Ref("searchInput") readonly searchInput!: HTMLInputElement;

  searchValue: string = "";
  isSearchOpened: boolean = false;

  allKnownBakers: BBKnownBaker[] = [];

  created() {
    this.loadData();
  }

  @Watch("selectedBaker")
  onSelectedBakerChange() {
    if (this.selectedBaker) {
      this.isSearchOpened = false;
    }
  }

  @Watch("searchValue")
  onSearchValueChange() {
    this.loadData();
  }

  @Watch("value")
  onValueChange() {
    this.selectBakerByAddress();
  }

  async loadData() {
    try {
      const list = await getAllKnownBakersMemoized();
      this.allKnownBakers = list.filter((b) =>
        this.searchValue
          ? b.name.toLowerCase().includes(this.searchValue.toLowerCase())
          : true
      );
    } catch (err) {
      console.error(err);
    }
  }

  toggleSearch() {
    this.isSearchOpened = !this.isSearchOpened;
    this.$nextTick(() => this.isSearchOpened && this.searchInput.focus());
  }

  selectBaker(baker: BBKnownBaker) {
    this.searchValue = "";
    if (!this.selectedBaker || this.selectedBaker.address !== baker.address) {
      this.$emit("baker-selected", baker);
    } else {
      this.isSearchOpened = false;
    }
  }

  async selectBakerByAddress() {
    const list = await getAllKnownBakersMemoized();
    const baker = list.find((b) => b.address === this.value);
    if (baker) {
      this.selectBaker(baker);
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
  @apply px-3 flex items-center;
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
