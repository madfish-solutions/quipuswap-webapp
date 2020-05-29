<template>
  <div class="flex flex-row">
    <div :class="`loading bg-accent ${sizes[size]} mx-1 rounded-full`"></div>
    <div :class="`loading bg-accent ${sizes[size]} mx-1 rounded-full`"></div>
    <div :class="`loading bg-accent ${sizes[size]} mx-1 rounded-full`"></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class AppLayout extends Vue {
  @Prop({ default: "small" }) size?: string;
  sizes: object = {
    small: "w-1 h-1",
    large: "w-2 h-2",
  };
}
</script>

<style lang="postcss" scoped>
.loading {
  animation: dots 1s steps(5, end) infinite;
}

@keyframes dots {
  0% {
    background-color: rgba(246, 204, 91, 1);
  }
  20% {
    background-color: rgba(246, 204, 91, 0.5);
  }
  40% {
    background-color: rgba(246, 204, 91, 0);
  }
  60% {
    background-color: rgba(246, 204, 91, 0.5);
  }
  80%,
  100% {
    background-color: rgba(246, 204, 91, 1);
  }
}
</style>
