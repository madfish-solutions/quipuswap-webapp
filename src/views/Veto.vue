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
          :dataLoading="dataLoading"
          readonly
        />

        <FormInfo>
          <div class="flex justify-between mb-1">
            <span class="mr-2 whitespace-no-wrap">Total votes</span>
            <span>{{ totalVotes !== null ? totalVotes : "-" }}</span>
          </div>

          <div class="flex justify-between mb-1">
            <span class="mr-2 whitespace-no-wrap">Total vetos</span>
            <span>{{ totalVetos !== null ? totalVetos : "-" }}</span>
          </div>

          <div class="flex justify-between mb-1">
            <span class="mr-2 whitespace-no-wrap">Votes need to make Veto</span>
            <span>{{ votesToVeto !== null ? votesToVeto : "-" }}</span>
          </div>
        </FormInfo>
      </Form>

      <Form class="mt-8" :style="processing && 'pointer-events:none'">
        <FormInfo class="my-2">
          <p class="text-base font-semibold text-center">Do you want to veto on current candidate?</p>

          <p class="mt-2 text-center">
            Ensure that your choice is correct as long as veto cannot be canceled.
            <br />If veto is successful, the candidate will be banned for 3 months.
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

        <FormIcon>
          <img :src="require('@/assets/plus.svg')" />
        </FormIcon>

        <FormField
          placeholder="0"
          label="Shares to veto"
          :withSelect="false"
          :withTezos="false"
          :subLabel="availableSharesToVeto ? `Your shares: ${availableSharesToVeto}` : ''"
          :isLoading="dataLoading"
          v-model="sharesToVeto"
          @input="e => handleSharesToVetoChange(e.target.value)"
        />
      </Form>

      <div class="flex justify-center mt-8 text-center align-center">
        <SubmitBtn
          :disabled="dataLoading || alreadyBanned || !valid"
          @click="handleBan"
          class="bg-red-700"
        >
          <template v-if="dataLoading || processing">
            <Loader size="large" />
          </template>
          <template v-else>
            {{
            alreadyBanned ? "Already banned" : banStatus
            }}
          </template>
        </SubmitBtn>

        <template v-if="availableSharesToExit">
          <div class="w-8" />

          <SubmitBtn class="truncate whitespace-no-wrap bg-accent text-primary border-2 border-primary" @click="handleExit">
            <template v-if="!exiting">{{ exitStatus }}<span v-if="exitStatus === 'Exit'" class="ml-1">({{ availableSharesToExit }} shares)</span></template>
            <template v-if="exiting">
              <Loader size="large" />
            </template>
          </SubmitBtn>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import * as NP from "number-precision";
import store, { getAccount, useThanosWallet } from "@/store";
import { BBKnownBaker } from "@/baking-bad";
import { QSAsset, getDexStorage, getDexShares, isAddressValid, clearMem } from "@/core";
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
  availableSharesToVeto: number | null = null;
  availableSharesToExit: number | null = null;
  alreadyBanned = false;

  voter: string = this.account.pkh;
  sharesToVeto = "";
  processing: boolean = false;
  exiting: boolean = false;
  banStatus: string = "Ban";
  exitStatus: string = "Exit";

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
    return this.currentCandidateExist && isAddressValid(this.voter) && +(this.sharesToVeto) > 0;;
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
      const me = this.account.pkh;

      const storage = await getDexStorage(this.selectedToken.exchange);
      const [
        myShares,
        voter
      ] = await Promise.all([
        getDexShares(me, this.selectedToken.exchange),
        storage.voters.get(me),
      ]);

      this.currentCandidate = storage.currentCandidate || "-";
      this.currentCandidateExist = Boolean(storage.currentCandidate);
      this.totalVotes = storage.totalVotes;
      this.totalVetos = storage.veto;
      this.votesToVeto = new BigNumber(storage.totalVotes)
        .div(2)
        .minus(storage.veto)
        .toNumber();
      this.availableSharesToVeto = myShares ? myShares.unfrozen.toNumber() : null;
      this.availableSharesToExit = voter ? voter.veto.toNumber() : null;

      if (me) {
        // const myVV = await storage.vetoVoters.get(me);
        // this.alreadyBanned = Boolean(myVV);
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

  handleSharesToVetoChange(amount: string) {
    const isNum = /^[0-9.]*$/g.test(amount);
    this.sharesToVeto = isNum ? amount : "";
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
      const sharesToVeto = +this.sharesToVeto;

      const tezos = await useThanosWallet();
      const contract = await tezos.wallet.at(this.selectedToken!.exchange);

      const batch = tezos.wallet.batch([])
        .withTransfer(
          contract.methods
            .approve(contract.address, sharesToVeto)
            .toTransferParams()
        )
        .withTransfer(
          contract.methods
            .use(7, "veto", sharesToVeto, this.voter)
            .toTransferParams()
        );

      const operation = await batch.send();
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
      await new Promise((r) => setTimeout(r, 5000));
      this.banStatus = "Ban";
    }
  }

  async handleExit() {
    if (this.exiting) return;
    this.exiting = true;

    try {
      const tezos = await useThanosWallet();
      const contract = await tezos.wallet.at(this.selectedToken!.exchange);

      const batch = tezos.wallet.batch([])
        .withTransfer(
          contract.methods
            .use(7, "veto", 0, this.voter)
            .toTransferParams()
        );

      const operation = await batch.send();
      await operation.confirmation();

      this.exitStatus = "Success";
      this.refresh();
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.exitStatus =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
          : "Something went wrong";
    } finally {
      this.exiting = false;
      await new Promise(r => setTimeout(r, 5000));
      this.exitStatus = "Exit";
    }
  }

  refresh() {
    clearMem();
    this.loadData();
  }
}
</script>
