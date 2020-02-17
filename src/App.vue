<template>
  <div id="app">
    <AppLayout class="py-4">
      <img class="mx-auto mb-6" src="./assets/logo.png" />
      <router-view />
    </AppLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AppLayout from "@/components/AppLayout.vue";

@Component({
  components: { AppLayout },
})
export default class App extends Vue {}
</script>

<style lang="scss">
html,
body {
  height: 100%;
}

#app {
  min-height: 100%;
  background: url("assets/lines.png") 100%, url("assets/gradient.png");
  background-size: cover, cover;
}
</style>
