<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <FormField placeholder="0.0" label="Input" />
      <FormIcon>
        <img src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField placeholder="0.0" label="Output" />
      <FormInfo class="flex justify-between">
        <span>Exchange rate</span>
        <span>-</span>
      </FormInfo>
    </Form>
    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      Select a token to continue
    </div>
    <div class="text-center">
      <SubmitBtn disabled>
        Swap
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import NavTabs from "@/components/NavTabs.vue";

import Form, { FormIcon, FormField, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";

@Component({
  components: { NavTabs, Form, FormIcon, FormField, FormInfo, SubmitBtn },
})
export default class Swap extends Vue {}
</script>
