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
          label="Delegated to"
          :withSelect="false"
          v-model="nextCandidate"
          :isLoading="isLoading"
          readonly
        />

        <FormIcon>
          <img src="@/assets/arrow-down.svg" class="transform rotate-180" />
        </FormIcon>

        <FormField
          placeholder="tz.."
          label="Second candidate"
          :withSelect="false"
          v-model="currentCandidate"
          :isLoading="isLoading"
          readonly
        />

        <FormInfo>
          <div class="flex justify-between mb-1">
            <span class="mr-2">Dex contract</span>
            <span class="font-mono text-gray-400">{{ dexAddress || "-" }}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span class="mr-2 whitespace-no-wrap">Total votes</span>
            <span>{{ totalVotes !== null ? totalVotes : "-" }}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span class="mr-2 whitespace-no-wrap">Total shares</span>
            <span>{{ totalShares !== null ? totalShares : "-" }}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span class="mr-2 whitespace-no-wrap">Your shares</span>
            <span>
              {{
                yourTotalShares !== null
                  ? `${yourTotalShares} (${toPercentage(
                      yourTotalShares / totalShares
                    )}%)`
                  : "-"
              }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="mr-2 whitespace-no-wrap">Your candidate</span>
            <span class="truncate">{{ yourCandidate }}</span>
          </div>
        </FormInfo>
      </Form>

      <Form class="mt-8" :style="processing && 'pointer-events:none'">
        <FormInfo>
          <div class="flex items-center justify-center text-base font-semibold">
            Vote for baker
          </div>
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
          :with-select="withBakersSelect"
          :selectedBaker="selectedBaker"
          v-on:baker-selected="selectBaker"
          :spellcheck="false"
        />

        <FormIcon>
          <img :src="require('@/assets/plus.svg')" />
        </FormIcon>

        <FormField
          placeholder="0"
          label="Shares to vote"
          :withSelect="false"
          :withTezos="false"
          :subLabelName="availableSharesToVote ? 'Your shares: ' : undefined"
          :subLabelValue="availableSharesToVote || undefined"
          :isLoading="isLoading"
          v-model="sharesToVote"
          @input="(e) => handleSharesToVoteChange(e.target.value)"
        />
      </Form>

      <div class="flex justify-center mt-8 text-center align-center">
        <SubmitBtn :disabled="!valid" @click="handleVote">
          <template v-if="!processing">{{
            voteStatus === "Vote" && availableSharesToExit
              ? "Revote"
              : voteStatus
          }}</template>
          <template v-if="processing">
            <Loader size="large" />
          </template>
        </SubmitBtn>

        <template v-if="availableSharesToExit">
          <div class="w-8" />

          <SubmitBtn
            class="truncate whitespace-no-wrap bg-accent border-2 border-gray-800 text-gray-800"
            @click="handleExit"
          >
            <template v-if="!exiting"
              >{{ exitStatus
              }}<span v-if="exitStatus === 'Exit'" class="ml-1"
                >({{ availableSharesToExit }} shares)</span
              ></template
            >
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
import store, { getAccount, useWallet } from "@/store";
import { BBKnownBaker } from "@/baking-bad";
import {
  QSAsset,
  getDexStorage,
  getDexShares,
  isAddressValid,
  clearMem,
  getNetwork,
  approveToken,
  deapproveFA2,
  isUnsafeAllowanceChangeError,
  sharesFromNat,
  sharesToNat,
  toAssetSlug,
  findTezDex,
} from "@/core";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";
import BakerFormField from "@/components/Form/BakerFormField.vue";
import Loader from "@/components/Loader.vue";
import BigNumber from "bignumber.js";
import { OpKind } from "@taquito/taquito";
import { notifyConfirm } from "../toast";

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
  dexAddress: string | null = null;

  currentCandidate: string = "-";
  nextCandidate: string = "-";
  totalShares: string | null = null;
  totalVotes: string | null = null;
  yourTotalShares: number | string | null = null;
  availableSharesToVote: number | string | null = null;
  availableSharesToExit: number | string | null = null;
  yourCandidate: string = "-";

  bakerAddress: string = "";
  selectedBaker: BBKnownBaker | null = null;

  voter: string = "";
  sharesToVote = "";
  processing: boolean = false;
  exiting: boolean = false;
  voteStatus: string = "Vote";
  exitStatus: string = "Exit";
  readyToVote: boolean = false;
  withBakersSelect = getNetwork().type === "main";

  get account() {
    return getAccount();
  }

  get selectedToken(): QSAsset | null {
    const tokenSlug = this.$route.params.token;
    return (
      store.state.tokens.find((t) => toAssetSlug(t) === tokenSlug) || null
    );
  }

  get valid() {
    return (
      this.dexAddress &&
      isAddressValid(this.bakerAddress) &&
      isAddressValid(this.voter) &&
      +this.sharesToVote > 0
    );
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
      this.dexAddress = null;
      const dex = await findTezDex(this.selectedToken);
      if (dex) {
        this.dexAddress = dex.address;

        const storage = await getDexStorage(dex.address);

        this.currentCandidate = storage.currentCandidate || "-";
        this.nextCandidate = storage.currentDelegated || "-";
        this.totalShares = sharesFromNat(storage.totalSupply).toFixed();
        this.totalVotes = sharesFromNat(storage.totalVotes).toFixed();

        const me = this.account.pkh || "";

        if (me) {
          const [myShares, voter] = await Promise.all([
            getDexShares(me, dex.address),
            storage.voters.get(me),
          ]);

          this.yourTotalShares = myShares ? sharesFromNat(myShares.total).toFixed() : null;
          this.availableSharesToVote = myShares
            ? sharesFromNat(myShares.unfrozen).toFixed()
            : null;
          if (this.availableSharesToVote !== null && voter) {
            this.availableSharesToVote = new BigNumber(this.availableSharesToVote)
              .plus(sharesFromNat(voter.vote))
              .toFixed();
          }
          this.availableSharesToExit = voter && new BigNumber(voter.vote).isGreaterThan(0) ? sharesFromNat(voter.vote).toFixed() : null;
          this.yourCandidate = voter ? voter.candidate : "-";
        }

        this.voter = me;
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  selectToken(token: QSAsset) {
    this.$router.replace(`/governance/vote-baker/${toAssetSlug(token)}`);
  }

  selectBaker(baker: BBKnownBaker) {
    this.selectedBaker = baker;
    this.bakerAddress = baker.address;
  }

  toPercentage(val: any) {
    return NP.round(val * 100, 2);
  }

  handleSharesToVoteChange(amount: string) {
    const isNum = /^[0-9.]*$/g.test(amount);
    this.sharesToVote = isNum ? amount : "";
  }

  async handleVote() {
    if (this.processing) return;
    this.processing = true;

    try {
      const dexAddress = this.dexAddress!;
      const sharesToVote = sharesToNat(this.sharesToVote).toFixed();

      const tezos = await useWallet();
      const contract = await tezos.wallet.at(dexAddress);

      const batch = tezos.wallet.batch([])
        .withTransfer(
          contract.methods
            .use("vote", this.bakerAddress, sharesToVote, this.voter)
            .toTransferParams()
        );

      const operation = await batch.send();

      notifyConfirm(
        operation.confirmation()
          .then(() => this.refresh())
      );
    } catch (err) {
      console.error(err);
      const msg = err.message;
      const tmp =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
          : "Something went wrong";
      this.voteStatus = tmp === "veto-candidate" ? "Baker under Veto" : tmp;
    } finally {
      this.processing = false;
      await new Promise((r) => setTimeout(r, 5000));
      this.voteStatus = "Vote";
    }
  }

  async handleExit() {
    if (this.exiting) return;
    this.exiting = true;

    try {
      const dexAddress = this.dexAddress!;
      const tezos = await useWallet();
      const contract = await tezos.wallet.at(dexAddress);

      const bakerStub =
        [this.nextCandidate, this.bakerAddress, this.voter].find(
          isAddressValid
        ) ?? "";

      const batch = tezos.wallet
        .batch([])
        .withTransfer(
          contract.methods
            .use("vote", bakerStub, 0, this.voter)
            .toTransferParams()
        );

      const operation = await batch.send();

      notifyConfirm(
        operation.confirmation()
          .then(() => this.refresh())
      );
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
      await new Promise((r) => setTimeout(r, 5000));
      this.exitStatus = "Exit";
    }
  }

  refresh() {
    clearMem();
    this.loadData();
  }
}
</script>
