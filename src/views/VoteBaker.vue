<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <GovernancePairSelect :selectedToken="selectedToken" v-on:token-selected="selectToken" />

    <template v-if="selectedToken">
      <Form>
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
            <span>Total votes</span>
            <span>{{ totalVotes !== null ? totalVotes : "-" }}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span>Total shares</span>
            <span>{{ totalShares !== null ? totalShares : "-" }}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span>Your shares</span>
            <span>
              {{
              yourShares !== null
              ? `${yourShares} (${toPercentage(yourShares / totalShares)}%)`
              : "-"
              }}
            </span>
          </div>
          <div class="flex justify-between">
            <span>Your candidate</span>
            <span>{{ yourCandidate }}</span>
          </div>
        </FormInfo>
      </Form>

      <Form class="mt-8">
        <FormInfo>
          <div class="flex items-center justify-center text-base font-semibold">Vote baker</div>
        </FormInfo>

        <FormField
          placeholder="tz1v7h3s..."
          label="Voter"
          :withSelect="false"
          v-model="voter"
          v-on:input="voter = $event.target.value"
          :isLoading="isLoading"
          :spellcheck="false"
        />

        <FormIcon>
          <img class="inline" src="@/assets/arrow-down.svg" />
        </FormIcon>

        <BakerFormField
          label="Baker"
          placeholder="tz1v7h3s..."
          v-model="bakerAddress"
          v-on:input="bakerAddress = $event.target.value"
          :selectedBaker="selectedBaker"
          v-on:baker-selected="selectBaker"
          :spellcheck="false"
        />
      </Form>

      <div class="mt-8 flex justify-center align-center text-center">
        <SubmitBtn :disabled="!readyToVote" @click="handleVote">
          <template v-if="!voting">{{ voteStatus }}</template>
          <template v-if="voting">
            <Loader size="large" />
          </template>
        </SubmitBtn>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as NP from "number-precision";
import { ITokenItem } from "@/api/getTokens";
import { getStorage, isAddressValid, useThanosWallet } from "@/taquito/tezos";
import store, { getAccount } from "@/store";
import bus from "@/store/bus";
import { BBKnownBaker } from "@/baking-bad";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";
import BakerFormField from "@/components/Form/BakerFormField.vue";
import Loader from "@/components/Loader.vue";

@Component({
  components: {
    NavTabs,
    NavGovernance,
    Form,
    FormField,
    FormIcon,
    FormInfo,
    SubmitBtn,
    GovernancePairSelect,
    BakerFormField,
    Loader,
  },
})
export default class VoteBaker extends Vue {
  isLoading: boolean = false;

  currentCandidate: string = "-";
  nextCandidate: string = "-";
  totalShares: number | null = null;
  totalVotes: number | null = null;
  yourShares: number | null = null;
  yourCandidate: string = "-";

  bakerAddress: string = "";
  selectedBaker: BBKnownBaker | null = null;

  voter: string = "";
  voting: boolean = false;
  voteStatus: string = "Vote";
  readyToVote: boolean = false;

  get account() {
    return getAccount();
  }

  get selectedToken(): ITokenItem | null {
    const tokenExchange = this.$route.params.token;
    return (
      store.state.tokens.find((t: any) => t.exchange === tokenExchange) || null
    );
  }

  created() {
    this.loadData();
  }

  mounted() {
    this.$watch(
      (vm?) => [vm.selectedToken, vm.account],
      () => this.loadData()
    );

    this.$watch(
      (vm?) => [vm.bakerAddress],
      () => this.bakerAddressChanged()
    );

    this.$watch(
      (vm?) => [vm.bakerAddress, vm.voter],
      () => this.validateVote()
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

      const me = this.account.pkh || "";

      if (me) {
        const [myShares, myCandidate] = await Promise.all([
          storage.shares.get(me),
          storage.voters.get(me),
        ]);

        this.yourShares = myShares ? +myShares : null;
        this.yourCandidate = myCandidate ? myCandidate.candidate : "-";
      }

      this.voter = me;
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

  validateVote() {
    this.readyToVote =
      isAddressValid(this.bakerAddress) && isAddressValid(this.voter);
  }

  toPercentage(val: any) {
    return NP.round(val * 100, 2);
  }

  async handleVote() {
    this.voting = true;
    try {
      const tezos = await useThanosWallet();
      const contract = await tezos.wallet.at(this.selectedToken!.exchange);
      const operation = await contract.methods
        .use(7, "vote", this.voter, this.bakerAddress)
        .send();
      await operation.confirmation();

      this.voteStatus = "Done!";
      bus.$emit("refreshWallet");
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.voteStatus = msg.startsWith("Dex/")
        ? msg.replace("Dex/", "Failed: ")
        : "Failed";
    } finally {
      this.voting = false;
      await new Promise(r => setTimeout(r, 5000));
      this.voteStatus = "Vote";
    }
  }
}
</script>
