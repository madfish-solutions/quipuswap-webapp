<template>
  <div id="app">
    <AppLayout class="pt-4 pb-12 relative px-4 xs:px-6">
      <button
        class="text-white w-56 h-12 border-2 border border-accent rounded-3px absolute right-0 top-40px right-40px hidden md:block"
      >
        Connect to a Wallet
      </button>
      <img class="mx-auto mb-12" src="./assets/logo.png" />
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
  background-size: 100%, cover;
  background-position: 0 0, 50%;
  font-family: "Roboto", sans-serif;
}
</style>
