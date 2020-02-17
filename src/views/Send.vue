<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <div class="form-wrapper">
      <FieldInput label="Ввести" />
      <div class="text-center py-2">
        <img class="inline" src="@/assets/arrow-down.png" />
      </div>
      <FieldInput label="Вывести" />
      <div class="text-center py-2">
        <img class="inline" src="@/assets/arrow-down.png" />
      </div>
      <FieldInput label="Адрес получателя" />
      <div class="py-2 px-6 flex justify-between">
        <span>Курс обмена</span>
        <span>-</span>
      </div>
    </div>

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
import FieldInput from "@/components/FieldInput.vue";
import NavTabs from "@/components/NavTabs.vue";

@Component({
  components: { NavTabs, FieldInput },
})
export default class Send extends Vue {}
</script>
