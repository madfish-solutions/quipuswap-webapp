<template>
  <div class="form-wrapper">
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Form extends Vue {}
</script>
