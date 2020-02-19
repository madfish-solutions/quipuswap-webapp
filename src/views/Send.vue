<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <div class="form-wrapper">
      <FieldInput label="Input" placeholder="0.0" />
      <div class="text-center py-2">
        <img class="inline" src="@/assets/arrow-down.png" />
      </div>
      <FieldInput label="Output" placeholder="0.0" />
      <div class="text-center py-2">
        <img class="inline" src="@/assets/arrow-down.png" />
      </div>
      <FieldInput label="Recipient Address" placeholder="0x1234..." :withSelect="false" />
      <div class="py-2 px-6 flex justify-between">
        <span>Exchange rate</span>
        <span>-</span>
      </div>
    </div>

    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      Select a token to continue
    </div>
    <div class="text-center">
      <button class="bg-primary text-text h-12 w-full max-w-xs rounded-3px text-lg">
        Send
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import FieldInput from "@/components/FieldInput.vue";
import NavTabs from "@/components/NavTabs.vue";

@Component({
  components: { NavTabs, FieldInput },
})
export default class Send extends Vue {}
</script>
