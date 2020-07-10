<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <NavGovernance />

      <div>Delegate Vote</div>
    </Form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form from "@/components/Form";

@Component({
  components: {
    NavTabs,
    NavGovernance,
    Form,
  },
})
export default class DelegateVote extends Vue {}
</script>
