<template>
  <div class="form-wrapper">
    <span>Info ha-ha</span>
    <div class="input-mock" />
    <span>Info ha-ha</span>
    <div class="input-mock" />
    <span>Info ha-ha</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class FormExample extends Vue {}
</script>

<style lang="postcss" scoped>
span {
  @apply px-2 py-1 inline-block;
}

.form-wrapper {
  @apply rounded-3px mx-4 text-text text-sm;
  background: #37415f;
}

.input-mock {
  @apply rounded-3px h-16 -mx-4;
  background: #2a3248;
}
</style>
