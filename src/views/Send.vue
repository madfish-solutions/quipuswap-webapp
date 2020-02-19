<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <FormField label="Input" placeholder="0.0" />
      <FormIcon>
        <img class="inline" src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField label="Output" placeholder="0.0" />
      <FormIcon>
        <img class="inline" src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField label="Recipient Address" placeholder="0x1234..." :withSelect="false" />
      <FormInfo class="flex justify-between">
        <span>Exchange rate</span>
        <span>-</span>
      </FormInfo>
    </Form>

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
import NavTabs from "@/components/NavTabs.vue";

import Form, { FormIcon, FormField, FormInfo } from "@/components/Form";

@Component({
  components: { NavTabs, Form, FormIcon, FormField, FormInfo },
})
export default class Send extends Vue {}
</script>
