<template>
  <div>
    <router-link to="/">Обменять</router-link>
    <router-link to="/send">Отправить</router-link>
    <router-link to="/add-liquidity">Вложить</router-link>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class NavTabs extends Vue {}
</script>
