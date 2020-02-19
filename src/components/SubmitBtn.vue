<template>
  <button
    v-bind="$attrs"
    v-on="$listeners"
    class="bg-primary text-text h-12 w-full max-w-xs rounded-3px text-lg"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class SubmitBtn extends Vue {}
</script>

<style lang="postcss" scoped>
button:disabled {
  @apply pointer-events-none;
  background: #37415f;
  color: #8892af;
}
</style>
