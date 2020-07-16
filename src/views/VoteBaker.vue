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
          <span>{{ totalShares !== null ? totalShares : "-" }}</span>
        </div>
        <div class="flex justify-between mb-1">
          <span>Your shares</span>
          <span>{{ yourShares !== null ? `${yourShares}%` : "-" }}</span>
        </div>
        <div class="flex justify-between">
          <span>Total votes</span>
          <span>{{ totalVotes !== null ? totalVotes : "-" }}</span>
        </div>
      </FormInfo>

      <BakerFormField
        label="Baker"
        placeholder="tz.."
        v-model="bakerAddress"
        v-on:input="bakerAddress = $event.target.value"
        :selectedBaker="selectedBaker"
        v-on:baker-selected="selectBaker"
        :spellcheck="false"
      />

      <!-- <FormField placeholder="tz.." label="Baker" withSelect />

      <FormInfo v-if="allKnownBakers.length > 0" class="mt-4">
        <button
          v-for="baker in allKnownBakers"
          :key="baker.address"
          class="p-2 w-full flex flex-stretch focus:outline-none"
        >
          {{ baker.name }}
        </button>
      </FormInfo> -->
    </Form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ITokenItem } from "@/api/getTokens";
import { getStorage, isAddressValid } from "@/taquito/tezos";
import store from "@/store";
import { BBKnownBaker } from "@/baking-bad";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";
import BakerFormField from "@/components/Form/BakerFormField.vue";

@Component({
  components: {
    NavTabs,
    NavGovernance,
    Form,
    FormField,
    FormIcon,
    FormInfo,
    GovernancePairSelect,
    BakerFormField,
  },
})
export default class VoteBaker extends Vue {
  isLoading: boolean = false;

  currentCandidate: string = "-";
  nextCandidate: string = "-";
  totalShares: number | null = null;
  totalVotes: number | null = null;
  yourShares: number | null = null;

  bakerAddress: string = "";
  selectedBaker: BBKnownBaker | null = null;

  get selectedToken(): ITokenItem | null {
    const tokenExchange = this.$route.params.token;
    return store.state.tokens.find((t: any) => t.exchange === tokenExchange) || null;
  }

  created() {
    this.loadData();
  }

  mounted() {
    this.$watch(
      (vm?) => [vm.selectedToken],
      () => this.loadData()
    );

    this.$watch(
      (vm?) => [vm.bakerAddress],
      () => this.bakerAddressChanged()
    );
  }

  async loadData() {
    if (!this.selectedToken) return;

    this.isLoading = true;
    try {
      const storage = await getStorage(this.selectedToken.exchange);

      this.currentCandidate = storage.currentDelegated || "-";
      this.nextCandidate = storage.delegated || "-";
      this.totalShares = storage.totalShares;
      this.totalVotes = storage.totalVotes;
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  selectToken(token: ITokenItem) {
    this.$router.replace(`/governance/vote-baker/${token.exchange}`);
  }

  selectBaker(baker: BBKnownBaker) {
    this.selectedBaker = baker;
    this.bakerAddress = baker.address;
  }

  bakerAddressChanged() {
    if (this.selectedBaker && !isAddressValid(this.bakerAddress)) {
      this.selectedBaker = null;
    }
  }
}
</script>
