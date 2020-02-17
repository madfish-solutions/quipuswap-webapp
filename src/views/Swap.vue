<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-4" />
    <div>
      This is swap
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "../components/NavTabs.vue";

@Component({
  components: { NavTabs },
})
export default class Swap extends Vue {}
</script>
