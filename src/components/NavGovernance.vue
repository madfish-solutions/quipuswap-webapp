<template>
  <div class="flex items-stretch">
    <router-link
      :to="
        $route.params.token
          ? `/governance/vote-baker/${$route.params.token}`
          : '/governance/vote-baker'
      "
      active-class="active"
      class="nav flex flex-col justify-around w-1/3 leading-tight text-center"
    >
      <span class="text-base xs:text-xl">Vote</span>
      <span class="text-xs">for Baker</span>
      <Tooltip
        position="corner"
        content="Choose a Baker who will be a Delegate in your Liquidity pool. Baker, who receives the majority of Liquidity Providers’ votes, becomes a delegate. By voting, your Quipu LP shares will be locked in the smart contract, to unlock them you need to exit from voting."
      />
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
      class="nav flex flex-col justify-around w-1/3 leading-tight text-center"
    >
      <span class="text-base xs:text-xl">Veto</span>
      <Tooltip
        position="corner"
        content="Ban a Baker from becoming a Delegate. A baker who receives ⅓  Liquidity Providers' votes in the veto section will be banned for 3 months and cannot receive votes during this period. By sending a Veto, your LP shares will be locked in the smart contract, to unlock them you need to exit from veto."
      />
    </router-link>

    <router-link
      :to="
        $route.params.token
          ? `/governance/rewards/${$route.params.token}`
          : '/governance/rewards'
      "
      active-class="active"
      class="nav flex flex-col justify-around w-1/3 leading-tight text-center"
    >
      <span class="text-base xs:text-xl">Rewards</span>
      <Tooltip
        position="corner"
        content="All Quipu Liquidity providers earn baking rewards for their XTZ in the liquidity pool. Read in <a href='https://madfish.crunch.help/quipu-swap/how-to-get-trading-fees-and-baking-rewards-on-quipu-swap' target='_blank' rel='nofollow noopener'>this article</a>, how to get your rewards."
      />
    </router-link>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Tooltip from "@/components/Tooltip.vue";

@Component({
  components: { Tooltip },
})
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
.nav {
  position: relative;
}
</style>
