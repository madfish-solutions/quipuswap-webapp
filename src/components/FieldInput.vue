<template>
  <div class="field">
    <div class="flex-1 flex flex-col jutify-center">
      <div class="label mb-2 text-lg font-light">{{ label }}</div>
      <input placeholder="Write pls..." :value="value" />
    </div>
    <div class="append">
      append
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class FieldInput extends Vue {
  @Prop() label?: string;

  value: string = "0.0";
}
</script>

<style lang="postcss" scoped>
.field {
  @apply rounded-3px h-24 -mx-4 px-6 flex items-center;
  background: #2a3248;
}

.label {
  color: #f6cc5b;
}

input {
  @apply bg-transparent outline-none text-xl font-light;
}

.append {
}
</style>
