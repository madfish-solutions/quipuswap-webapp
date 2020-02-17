<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <div class="form-wrapper">
      <div class="px-6 py-2 text-accent font-normal text-lg">
        Добавить ликвидность
      </div>
      <FieldInput label="Вложить" />
      <div class="text-center py-2">
        <img class="inline" src="@/assets/plus.png" />
      </div>
      <FieldInput label="Вложить" />
      <div class="py-2 px-6">
        <div class="flex justify-between mb-1">
          <span>Курс обмена</span>
          <span>-</span>
        </div>
        <div class="flex justify-between mb-1">
          <span>Текущий размер пула</span>
          <span>-</span>
        </div>
        <div class="flex justify-between">
          <span>Ваша доля в пуле (%)</span>
          <span>-</span>
        </div>
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
export default class AddLiquidity extends Vue {}
</script>
