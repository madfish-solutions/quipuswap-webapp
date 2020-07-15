<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <GovernancePairSelect :selectedToken="selectedToken" v-on:token-selected="selectToken" />

    <Form v-if="selectedToken">
      <NavGovernance />

      <FormField
        placeholder="tz.."
        label="Current candidate"
        :withSelect="false"
        v-model="currentCandidate"
        :isLoading="isLoading"
        readonly
      />

      <FormIcon>
        <img src="@/assets/arrow-down.svg" />
      </FormIcon>

      <FormField
        placeholder="tz.."
        label="Next candidate"
        :withSelect="false"
        v-model="nextCandidate"
        :isLoading="isLoading"
        readonly
      />

      <FormInfo>
        <div class="flex justify-between mb-1">
          <span>Total shares</span>
          <span>{{totalShares !== null ? totalShares : "-"}}</span>
        </div>
        <div class="flex justify-between mb-1">
          <span>Your shares</span>
          <span>{{yourShares !== null ? `${yourShares}%` : "-"}}</span>
        </div>
        <div class="flex justify-between">
          <span>Total votes</span>
          <span>{{totalVotes !== null ? totalVotes : "-"}}</span>
        </div>
      </FormInfo>
    </Form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ITokenItem } from "@/api/getTokens";
import { getStorage } from "@/taquito/tezos";
import store from "@/store";
import { getAllKnownBakers, BBKnownBaker } from "@/baking-bad";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";

@Component({
  components: {
    NavTabs,
    NavGovernance,
    Form,
    FormField,
    FormIcon,
    FormInfo,
    GovernancePairSelect,
  },
})
export default class VoteBaker extends Vue {
  isLoading: boolean = false;

  currentCandidate: string = "-";
  nextCandidate: string = "-";
  totalShares: number | null = null;
  totalVotes: number | null = null;
  yourShares: number | null = null;

  allKnownBakers: BBKnownBaker[] = [];

  get selectedToken(): ITokenItem | null {
    const tokenExchange = this.$route.params.token;
    return (
      store.state.tokens.find((t: any) => t.exchange === tokenExchange) || null
    );
  }

  mounted() {
    this.$watch(
      (vm?) => [vm.selectedToken],
      () => {
        if (this.selectedToken) {
          this.loadData(this.selectedToken);
        }
      }
    );
  }

  async loadData(token: ITokenItem) {
    try {
      this.isLoading = true;

      const storage = await getStorage(token.exchange);

      this.currentCandidate = storage.currentDelegated || "-";
      this.nextCandidate = storage.delegated || "-";
      this.totalShares = storage.totalShares;
      this.totalVotes = storage.totalVotes;

      this.isLoading = false;
    } catch (err) {
      console.error(err);
    }
  }

  selectToken(token: ITokenItem) {
    this.$router.replace(`/governance/vote-baker/${token.exchange}`);
  }
}
</script>
