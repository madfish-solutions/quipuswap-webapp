<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <NavInvest />
      <FormField label="Token address" placeholder="0x1234..." :withSelect="false" />
      <FormInfo>
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
      </FormInfo>
    </Form>

    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      Select a token to continue
    </div>
    <div class="text-center">
      <button class="bg-primary text-text h-12 w-full max-w-xs rounded-3px text-lg">
        Create exchange
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";
import NavInvest from "@/components/NavInvest.vue";

import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";

@Component({
  components: { NavTabs, NavInvest, Form, FormField, FormIcon, FormInfo },
})
export default class CreateExchange extends Vue {}
</script>
