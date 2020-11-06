<template>
  <div class="flex items-stretch">
    <router-link
      :to="
        $route.params.token
          ? `/governance/vote-baker/${$route.params.token}`
          : '/governance/vote-baker'
      "
      active-class="active"
      class="flex flex-col justify-around w-1/3 leading-tight text-center"
    >
      <span class="text-base xs:text-xl">Vote</span>
      <span class="text-xs">for Baker</span>
    </router-link>

    <!-- <router-link
      :to="
        $route.params.token
          ? `/governance/delegate-vote/${$route.params.token}`
          : '/governance/delegate-vote'
      "
      active-class="active"
      class="flex flex-col justify-around w-1/4 leading-tight text-center"
    >
      <span class="text-base xs:text-xl">Delegate</span>
      <span class="text-xs">Vote</span>
    </router-link> -->

    <router-link
      :to="
        $route.params.token
          ? `/governance/veto/${$route.params.token}`
          : '/governance/veto'
      "
      active-class="active"
      class="flex flex-col justify-around w-1/3 leading-tight text-center"
    >
      <span class="text-base xs:text-xl">Veto</span>
    </router-link>

    <router-link
      :to="
        $route.params.token
          ? `/governance/rewards/${$route.params.token}`
          : '/governance/rewards'
      "
      active-class="active"
      class="flex flex-col justify-around w-1/3 leading-tight text-center"
    >
      <span class="text-base xs:text-xl">Rewards</span>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class NavGovernance extends Vue {}
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
