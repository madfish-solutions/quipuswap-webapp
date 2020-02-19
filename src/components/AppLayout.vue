<template>
  <div class="container mx-auto pb-32 md:pb-16">
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AppLayout extends Vue {}
</script>
