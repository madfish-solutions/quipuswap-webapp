<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <NavInvest />
      <FormField label="Pool tokens" placeholder="0.0" />
      <FormIcon>
        <img src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField label="Output" :withSelect="false" />
      <FormInfo>
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
      </FormInfo>
    </Form>

    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      Select a token to continue
    </div>
    <div class="text-center">
      <SubmitBtn disabled>
        Remove Liquidity
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";
import NavInvest from "@/components/NavInvest.vue";

import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";

@Component({
  components: { NavTabs, NavInvest, Form, FormField, FormIcon, FormInfo, SubmitBtn },
})
export default class RemoveLiquidity extends Vue {}
</script>
