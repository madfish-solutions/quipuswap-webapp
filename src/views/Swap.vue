<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-4" />
    <FormExample />
    <div>
      This is swap
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import FormExample from "@/components/FormExample.vue";
import NavTabs from "@/components/NavTabs.vue";

@Component({
  components: { NavTabs, FormExample },
})
export default class Swap extends Vue {}
</script>
