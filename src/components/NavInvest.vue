<template>
  <div class="flex">
    <div class="w-1/3 text-center">
      <router-link
        to="/invest/add-liquidity"
        active-class="active"
        class="nav flex flex-col leading-tight"
      >
        <span class="text-base xs:text-xl">Add</span>
        <span class="text-xs">Liquidity</span>
        <Tooltip
          position="corner"
          content="Add your tokens to the existing liquidity pool and earn trading fees and baking rewards. The complete instruction on how to do this you may find <a href='https://madfish.crunch.help/quipu-swap/how-to-add-liquidity-to-the-existing-liquidity-pool-on-quipu-swap' target='_blank' rel='nofollow noopener'>here</a>. Instead of your tokens, you will receive shares that you may use for voting purposes or farming projects."
        />
      </router-link>
    </div>
    <div class="w-1/3 text-center">
      <router-link
        to="/invest/remove-liquidity"
        active-class="active"
        class="nav flex flex-col leading-tight"
      >
        <span class="text-base xs:text-xl">Remove</span>
        <span class="text-xs">Liquidity</span>
        <Tooltip
          position="corner"
          content="Burn your Quipu liquidity shares and receive your tokens from the pool to wallet."
        />
      </router-link>
    </div>
    <div class="w-1/3 text-center">
      <router-link
        to="/invest/add-token"
        active-class="active"
        class="nav flex flex-col leading-tight"
      >
        <span class="text-base xs:text-xl">Add</span>
        <span class="text-xs">new Token</span>
        <Tooltip
          position="corner"
          content="Create a Liquidity pool with a new token. You need to add a pair of tokens: your token and XTZ. Read how to do these actions in <a href='https://madfish.crunch.help/quipu-swap/how-to-add-a-new-liquidity-pool-to-quipu-swap' target='_blank' rel='nofollow noopener'>the tutorial.</a>"
        />
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Tooltip from "@/components/Tooltip.vue";

@Component({
  components: { Tooltip },
})
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

.nav {
  position: relative;
}
</style>
