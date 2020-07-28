<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <GovernancePairSelect
      :selectedToken="selectedToken"
      v-on:token-selected="selectToken"
    />

    <template v-if="selectedToken">
      <Form>
        <NavGovernance />

        <FormField
          placeholder="tz.."
          label="Current candidate"
          :withSelect="false"
          v-model="currentCandidate"
          :dataLoading="dataLoading"
          readonly
        />

        <FormInfo>
          <div class="flex justify-between mb-1">
            <span class="whitespace-no-wrap mr-2">Total votes</span>
            <span>{{ totalVotes !== null ? totalVotes : "-" }}</span>
          </div>

          <div class="flex justify-between mb-1">
            <span class="whitespace-no-wrap mr-2">Total vetos</span>
            <span>{{ totalVetos !== null ? totalVetos : "-" }}</span>
          </div>

          <div class="flex justify-between mb-1">
            <span class="whitespace-no-wrap mr-2">Votes need to make Veto</span>
            <span>{{ votesToVeto !== null ? votesToVeto : "-" }}</span>
          </div>
        </FormInfo>
      </Form>

      <Form class="mt-8" :style="processing && 'pointer-events:none'">
        <FormInfo class="my-2">
          <p class="text-center text-base font-semibold">
            Do you want to veto Current Candidate?
          </p>

          <p class="mt-2 text-center">
            Be sure in your choise, you cannot cancel veto.<br />
            If successful, the candidate will be banned for 3 months.
          </p>
        </FormInfo>

        <FormField
          placeholder="tz1v7h3s..."
          label="Voter"
          :withSelect="false"
          v-model="voter"
          v-on:input="voter = $event.target.value"
          :spellcheck="false"
        />
      </Form>

      <div class="mt-8 flex justify-center align-center text-center">
        <SubmitBtn
          :disabled="dataLoading || alreadyBanned || !valid"
          @click="handleBan"
          class="bg-red-700"
        >
          <template v-if="dataLoading || processing">
            <Loader size="large" />
          </template>
          <template v-else>{{
            alreadyBanned ? "Already banned" : banStatus
          }}</template>
        </SubmitBtn>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import * as NP from "number-precision";
import { useThanosWallet } from "@/taquito/tezos";
import store, { getAccount } from "@/store";
import { BBKnownBaker } from "@/baking-bad";
import { QSAsset, getDexStorage, isAddressValid, clearMem } from "@/core";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";
import BakerFormField from "@/components/Form/BakerFormField.vue";
import Loader from "@/components/Loader.vue";
import BigNumber from "bignumber.js";

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
export default class Veto extends Vue {
  dataLoading: boolean = false;

  currentCandidate: string = "-";
  currentCandidateExist = false;
  totalVotes: number | null = null;
  totalVetos: number | null = null;
  votesToVeto: number | null = null;
  alreadyBanned = false;

  voter: string = this.account.pkh;
  processing: boolean = false;
  banStatus: string = "Ban";

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
    return this.currentCandidateExist && isAddressValid(this.voter);
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
    this.voter = this.account.pkh;
    this.loadData();
  }

  async loadData() {
    if (!this.selectedToken) return;

    this.dataLoading = true;
    try {
      const storage = await getDexStorage(this.selectedToken.exchange);

      this.currentCandidate = storage.currentDelegated || "-";
      this.currentCandidateExist = Boolean(storage.currentDelegated);
      this.totalVotes = storage.totalVotes;
      this.totalVetos = storage.veto;
      this.votesToVeto = new BigNumber(storage.totalVotes)
        .div(2)
        .minus(storage.veto)
        .toNumber();

      const me = this.account.pkh;

      if (me) {
        const myVV = await storage.vetoVoters.get(me);
        this.alreadyBanned = Boolean(myVV);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.dataLoading = false;
    }
  }

  selectToken(token: QSAsset) {
    this.$router.replace(`/governance/veto/${token.exchange}`);
  }

  toPercentage(val: any) {
    return NP.round(val * 100, 2);
  }

  async handleBan() {
    if (this.processing) return;
    this.processing = true;

    try {
      await this.$confirm(
        "Are you sure you want to veto Current Candidate?",
        "Confirm",
        "warning",
        {
          confirmButtonText: "Yes, ban",
        }
      );
    } catch (_err) {
      this.processing = false;
      return;
    }

    try {
      const tezos = await useThanosWallet();
      const contract = await tezos.wallet.at(this.selectedToken!.exchange);
      const operation = await contract.methods
        .use(8, "veto", this.voter)
        .send();
      await operation.confirmation();

      this.banStatus = "Success";
      this.refresh();
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.banStatus =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
          : "Something went wrong";
    } finally {
      this.processing = false;
      await new Promise(r => setTimeout(r, 5000));
      this.banStatus = "Ban";
    }
  }

  refresh() {
    clearMem();
    this.loadData();
  }
}
</script>
