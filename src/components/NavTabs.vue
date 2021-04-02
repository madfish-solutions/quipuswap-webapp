<template>
  <div class="h-10 nav-wrapper shadow-lg">
    <router-link class="nav-item" active-class="active" to="/swap">
      <span>Swap</span></router-link
    >
    <router-link class="nav-item" active-class="active" to="/send"
      ><span>Send</span></router-link
    >
    <router-link class="nav-item" active-class="active" to="/invest"
      ><span>Invest</span></router-link
    >
    <router-link class="nav-item" active-class="active" to="/governance"
      ><span>Governance</span></router-link
    >
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class NavTabs extends Vue {}
</script>

<style lang="postcss" scoped>
.nav-wrapper {
  @apply flex text-white rounded-3px;
  background: #37415f;
  /* background: rgba(55, 65, 95, 0.4); */
  overflow: hidden;
}

.nav-item {
  @apply h-full w-1/3 flex items-center justify-center bg-transparent rounded-3px;
  transition: all ease 0.35s;
}

.nav-item span {
  @apply leading-none;
}

.nav-item.active {
  @apply font-semibold opacity-90;
  background: #5b61f6;
}

.nav-item span {
  @apply opacity-90;
}

.nav-item.active span {
  @apply opacity-100;
}
</style>
