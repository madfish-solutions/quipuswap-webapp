<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <div class="form-wrapper">
      <InvestNav />
      <FieldInput placeholder="0.0" label="Deposit" />
      <div class="text-center py-2">
        <img class="inline" src="@/assets/plus.png" />
      </div>
      <FieldInput placeholder="0.0" label="Deposit" />
      <div class="py-2 px-6">
        <div class="flex justify-between mb-1">
          <span>Exchange rate</span>
          <span>-</span>
        </div>
        <div class="flex justify-between mb-1">
          <span>Current pool size</span>
          <span>-</span>
        </div>
        <div class="flex justify-between">
          <span>Your Pool Share (%)</span>
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
export default class AddLiquidity extends Vue {}
</script>
