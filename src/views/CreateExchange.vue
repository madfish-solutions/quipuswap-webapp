<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <div class="form-wrapper">
      <InvestNav />
      <FieldInput label="Token address" placeholder="0x1234..." :withSelect="false" />
      <div class="py-2 px-6">
        <div class="flex justify-between mb-1">
          <span>Name</span>
          <span>-</span>
        </div>
        <div class="flex justify-between mb-1">
          <span>Symbols</span>
          <span>-</span>
        </div>
        <div class="flex justify-between">
          <span>Decimals</span>
          <span>-</span>
        </div>
      </div>
    </div>

    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      Select a token to continue
    </div>
    <div class="text-center">
      <button class="bg-primary text-text h-12 w-full max-w-xs rounded-3px text-lg">
        Add Liquidity
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import FieldInput from "@/components/FieldInput.vue";
import NavTabs from "@/components/NavTabs.vue";
import InvestNav from "@/components/InvestNav.vue";

@Component({
  components: { NavTabs, FieldInput, InvestNav },
})
export default class CreateExchange extends Vue {}
</script>
