<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <GovernancePairSelect :selectedToken="selectedToken" v-on:token-selected="selectToken" />

    <Form>
      <NavGovernance />

      <div>Veta</div>
    </Form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ITokenItem } from "@/api/getTokens";
import store from "@/store";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form from "@/components/Form";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";

@Component({
  components: {
    NavTabs,
    NavGovernance,
    Form,
    GovernancePairSelect,
  },
})
export default class Veta extends Vue {
  get selectedToken(): ITokenItem | null {
    const tokenExchange = this.$route.params.token;
    return (
      store.state.tokens.find((t: any) => t.exchange === tokenExchange) || null
    );
  }

  selectToken(token: ITokenItem) {
    this.$router.replace(`/governance/veta/${token.exchange}`);
  }
}
</script>
