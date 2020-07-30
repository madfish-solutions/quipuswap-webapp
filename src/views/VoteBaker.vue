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
            <span class="whitespace-no-wrap mr-2">Total votes</span>
            <span>{{ totalVotes !== null ? totalVotes : "-" }}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span class="whitespace-no-wrap mr-2">Total shares</span>
            <span>{{ totalShares !== null ? totalShares : "-" }}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span class="whitespace-no-wrap mr-2">Your shares</span>
            <span>
              {{
              yourShares !== null
              ? `${yourShares} (${toPercentage(yourShares / totalShares)}%)`
              : "-"
              }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="whitespace-no-wrap mr-2">Your candidate</span>
            <span class="truncate">{{ yourCandidate }}</span>
          </div>
        </FormInfo>
      </Form>

      <Form class="mt-8" :style="processing && 'pointer-events:none'">
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
        <SubmitBtn :disabled="!valid" @click="handleVote">
          <template v-if="!processing">{{ voteStatus }}</template>
          <template v-if="processing">
            <Loader size="large" />
          </template>
        </SubmitBtn>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import * as NP from "number-precision";
import store, { getAccount, useThanosWallet } from "@/store";
import { BBKnownBaker } from "@/baking-bad";
import { QSAsset, getDexStorage, isAddressValid, clearMem } from "@/core";
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
  processing: boolean = false;
  voteStatus: string = "Vote";
  readyToVote: boolean = false;

  get account() {
    return getAccount();
  }

  get selectedToken(): QSAsset | null {
    const tokenExchange = this.$route.params.token;
    return (
      store.state.tokens.find((t: any) => t.exchange === tokenExchange) || null
    );
  }

  get valid() {
    return isAddressValid(this.bakerAddress) && isAddressValid(this.voter);
  }

  created() {
    this.loadData();
  }

  @Watch("selectedToken")
  onSelectedTokenChange() {
    this.loadData();
  }

  @Watch("account")
  onAccountChange() {
    this.loadData();
  }

  @Watch("bakerAddress")
  onBakerAddressChange() {
    if (this.selectedBaker && !isAddressValid(this.bakerAddress)) {
      this.selectedBaker = null;
    }
  }

  async loadData() {
    if (!this.selectedToken) return;

    this.isLoading = true;
    try {
      const storage = await getDexStorage(this.selectedToken.exchange);

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

  selectToken(token: QSAsset) {
    this.$router.replace(`/governance/vote-baker/${token.exchange}`);
  }

  selectBaker(baker: BBKnownBaker) {
    this.selectedBaker = baker;
    this.bakerAddress = baker.address;
  }

  toPercentage(val: any) {
    return NP.round(val * 100, 2);
  }

  async handleVote() {
    if (this.processing) return;
    this.processing = true;
    try {
      const tezos = await useThanosWallet();
      const contract = await tezos.wallet.at(this.selectedToken!.exchange);
      const operation = await contract.methods
        .use(7, "vote", this.voter, this.bakerAddress)
        .send();
      await operation.confirmation();

      this.voteStatus = "Success";
      this.refresh();
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.voteStatus =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
          : "Something went wrong";
    } finally {
      this.processing = false;
      await new Promise((r) => setTimeout(r, 5000));
      this.voteStatus = "Vote";
    }
  }

  refresh() {
    clearMem();
    this.loadData();
  }
}
</script>
