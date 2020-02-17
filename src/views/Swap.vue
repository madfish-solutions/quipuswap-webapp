<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <FormExample />
    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      Введите токен, чтобы продолжить
    </div>
    <div class="text-center">
      <button class="bg-primary text-text h-12 w-full max-w-xs rounded-3px text-lg">
        Connect to a Wallet
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import FormExample from "@/components/FormExample.vue";
import NavTabs from "@/components/NavTabs.vue";

@Component({
  components: { NavTabs, FormExample },
})
export default class Swap extends Vue {}
</script>
