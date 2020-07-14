<template>
  <div>
    <GovernancePairSelect />

    <div class="flex items-stretch">
      <router-link
        to="/governance/vote-baker"
        active-class="active"
        class="w-1/4 flex flex-col justify-around text-center leading-tight"
      >
        <span class="text-base xs:text-xl">Vote</span>
        <span class="text-xs">Baker</span>
      </router-link>

      <router-link
        to="/governance/delegate-vote"
        active-class="active"
        class="w-1/4 flex flex-col justify-around text-center leading-tight"
      >
        <span class="text-base xs:text-xl">Delegate</span>
        <span class="text-xs">Vote</span>
      </router-link>

      <router-link
        to="/governance/veta"
        active-class="active"
        class="w-1/4 flex flex-col justify-around text-center leading-tight"
      >
        <span class="text-base xs:text-xl">Veta</span>
      </router-link>

      <router-link
        to="/governance/rewards"
        active-class="active"
        class="w-1/4 flex flex-col justify-around text-center leading-tight"
      >
        <span class="text-base xs:text-xl">Rewards</span>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";

@Component({
  components: { GovernancePairSelect },
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
</style>
