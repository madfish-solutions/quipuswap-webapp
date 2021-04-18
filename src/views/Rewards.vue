<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <GovernancePairSelect
      :selectedToken="selectedToken"
      v-on:token-selected="selectToken"
    />

    <template v-if="selectedToken">
      <Form :style="processing && 'pointer-events:none'">
        <NavGovernance />

        <FormField
          placeholder="tz1v7h3s..."
          label="Recipient"
          :withSelect="false"
          v-model="recipientAddress"
          v-on:input="recipientAddress = $event.target.value"
          :spellcheck="false"
        />

        <FormInfo>
          <div v-if="dataLoading" class="flex items-center justify-center p-4">
            <Loader size="large" />
          </div>
          <p v-else class="py-4 text-xl">
            Your Rewards:
            <span class="mr-1 text-accent">{{ rewards }}</span>
            <span class="text-sm opacity-90">XTZ</span>
          </p>
        </FormInfo>
      </Form>

      <div class="flex justify-center mt-4 text-center align-center">
        <SubmitBtn :disabled="!valid" @click="handleWithdraw">
          <template v-if="!processing">{{ withdrawStatus }}</template>
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
import store, { getAccount, useWallet } from "@/store";
import {
  QSAsset,
  isAddressValid,
  getDexStorage,
  clearMem,
  mutezToTz,
  ACCURANCY_MULTIPLIER,
  VOTING_PERIOD,
  getDexShares,
  getContract
} from "@/core";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import Loader from "@/components/Loader.vue";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";
import BigNumber from "bignumber.js";
import { notifyConfirm } from "../toast";

@Component({
  components: {
    NavTabs,
    NavGovernance,
    Form,
    FormField,
    FormIcon,
    FormInfo,
    GovernancePairSelect,
    SubmitBtn,
    Loader,
  },
})
export default class Rewards extends Vue {
  dataLoading = false;
  rewards = "0";

  recipientAddress: string = this.account.pkh;

  processing: boolean = false;
  withdrawStatus: string = "Withdraw";

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
    return isAddressValid(this.recipientAddress);
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
    this.recipientAddress = this.account.pkh;
    this.loadData();
  }

  async loadData() {
    this.rewards = "0";

    if (!this.selectedToken || !this.account.pkh) return;

    this.dataLoading = true;
    try {
      const dexContract = await getContract(this.selectedToken.exchange);
      const { storage } = await dexContract.storage<any>();
      const [rewards, shares] = await Promise.all([
        storage.user_rewards.get(this.account.pkh),
        storage.ledger.get(this.account.pkh),
      ]);

      let reward = new BigNumber(rewards?.reward ?? 0);
      if (shares) {
        const now = new Date();
        const periodFinish = new Date(storage.period_finish);
        const lastUpdateTime = new Date(storage.last_update_time);
        const rewardsTime = now > periodFinish ? periodFinish : now;
        let newReward = new BigNumber(
          Math.abs(+rewardsTime - +lastUpdateTime)
        ).idiv(1000).times(storage.reward_per_sec);

        if (now > periodFinish) {
          const periodsDuration = new BigNumber(+now - +periodFinish).idiv(1000)
            .idiv(VOTING_PERIOD)
            .plus(1)
            .times(VOTING_PERIOD);
          const rewardPerSec = new BigNumber(storage.reward)
            .times(ACCURANCY_MULTIPLIER)
            .idiv(periodsDuration.abs());
          newReward = new BigNumber(+now - +periodFinish).idiv(1000).abs().times(rewardPerSec);
        }

        const rewardPerShare = new BigNumber(storage.reward_per_share).plus(
          newReward.idiv(storage.total_supply)
        );
        const totalShares = new BigNumber(shares.balance).plus(
          shares.frozen_balance
        );
        reward = reward.plus(
          totalShares
            .times(rewardPerShare)
            .minus(rewards?.reward_paid ?? 0)
            .abs()
        );
      }

      const val = reward.idiv(ACCURANCY_MULTIPLIER);
      this.rewards = mutezToTz(val).toFormat(6);
    } catch (err) {
      console.error(err);
    } finally {
      this.dataLoading = false;
    }
  }

  selectToken(token: QSAsset) {
    this.$router.replace(`/governance/rewards/${token.exchange}`);
  }

  async handleWithdraw() {
    if (this.processing) return;
    this.processing = true;
    try {
      const tezos = await useWallet();
      const contract = await tezos.wallet.at(this.selectedToken!.exchange);
      const operation = await contract.methods
        .use("withdrawProfit", this.recipientAddress)
        .send();

      notifyConfirm(
        operation.confirmation()
          .then(() => this.refresh())
      );
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.withdrawStatus =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
          : "Something went wrong";
    } finally {
      this.processing = false;
      await new Promise((r) => setTimeout(r, 5000));
      this.withdrawStatus = "Withdraw";
    }
  }

  refresh() {
    clearMem();
    this.loadData();
  }
}
</script>
