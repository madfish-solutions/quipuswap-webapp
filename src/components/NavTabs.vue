<template>
  <div class="h-10 nav-wrapper">
    <router-link class="nav-item" active-class="active" exact to="/">
      <span>Обменять</span></router-link
    >
    <router-link class="nav-item" active-class="active" to="/send"
      ><span>Отправить</span></router-link
    >
    <router-link class="nav-item" active-class="active" to="/add-liquidity"
      ><span>Вложить</span></router-link
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
