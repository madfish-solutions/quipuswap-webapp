<template>
  <div class="flex">
    <div class="w-1/3 text-center">
      <router-link
        to="/invest/add-liquidity"
        active-class="active"
        class="flex flex-col leading-tight"
      >
        <span class="text-base xs:text-xl">Add</span>
        <span class="text-xs">Liquidity</span>
      </router-link>
    </div>
    <div class="w-1/3 text-center">
      <router-link
        to="/invest/remove-liquidity"
        active-class="active"
        class="flex flex-col leading-tight"
      >
        <span class="text-base xs:text-xl">Remove</span>
        <span class="text-xs">Liquidity</span>
      </router-link>
    </div>
    <div class="w-1/3 text-center">
      <router-link
        to="/invest/add-token"
        active-class="active"
        class="flex flex-col leading-tight"
      >
        <span class="text-base xs:text-xl">Add</span>
        <span class="text-xs">new Token</span>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class NavInvest extends Vue {}
</script>

<style lang="postcss" scoped>
a {
  @apply text-white opacity-50 border-b-2 border-transparent rounded-t-3px py-3;
}

a span {
  @apply relative;
  top: 1px;
}

a.active {
  @apply opacity-100 text-accent border-accent;

  background: rgba(246, 204, 91, 0.05);

  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}
</style>
