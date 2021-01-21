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
} from "@/core";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import Loader from "@/components/Loader.vue";
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
      const storage = await getDexStorage(this.selectedToken.exchange);
      const myCl = await storage.userRewards.get(this.account.pkh);
      if (myCl) {
        this.rewards = mutezToTz(
          myCl.reward.div(ACCURANCY_MULTIPLIER)
        ).toFormat(6);
      }
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
      await operation.confirmation();

      this.withdrawStatus = "Success";
      this.refresh();
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
