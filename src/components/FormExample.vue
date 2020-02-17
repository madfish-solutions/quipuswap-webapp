<template>
  <div class="form-wrapper">
    <FieldInput label="Ввести" />
    <div class="text-center py-2">
      <img class="inline" src="@/assets/arrow-down.png" />
    </div>
    <FieldInput label="Вывести" />
    <div class="py-2 px-6 flex justify-between">
      <span>Курс обмена</span>
      <span>-</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import FieldInput from "@/components/FieldInput.vue";

@Component({
  components: { FieldInput },
})
export default class FormExample extends Vue {}
</script>
