<template>
  <div id="app">
    <AppLayout>
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
  background: rgba(0, 0, 0, 0.22);
}
</style>
