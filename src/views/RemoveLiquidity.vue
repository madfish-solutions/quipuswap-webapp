<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <Form :style="processing && 'pointer-events:none'">
      <NavInvest />

      <FormField
        placeholder="0.0"
        label="Shares to remove"
        :withTezos="false"
        :subLabel="myShares ? `Your shares: ${myShares}` : ''"
        :isLoading="tokenLoading"
        v-model="sharesToRemove"
        @input="e => handleSharesToRemoveChange(e.target.value)"
        @selectToken="handleTokenSelect"
        :selectedToken="selectedToken"
      />

      <FormIcon>
        <img :src="require('@/assets/arrow-down.svg')" />
      </FormIcon>

      <div class="-mx-3 xs:-mx-4 shadow-lg">
        <div class="field rounded-3px relative">
          <div class="py-6 flex-1 flex flex-col justify-start">
            <div class="label mb-1 xs:mb-2 sm:text-lg font-light w-full">
              Output
              <span class="text-sm">(estimated)</span>
            </div>

            <div v-if="inTokens" class="flex flex-col fieldval">
              <div class="mb-1">
                <span class="opacity-75 mr-1">+</span>
                <span class="tracking-wide">
                  {{
                  formatNum(inTokens.tezos, 6)
                  }}
                </span>
                <span class="ml-1 text-sm opacity-90">XTZ</span>
              </div>

              <div class="mb-1">
                <span class="opacity-75 mr-1">+</span>
                <span class="tracking-wide">
                  {{
                  formatNum(inTokens.token, 0)
                  }}
                </span>
                <span class="ml-1 text-sm opacity-90">Token</span>
              </div>
            </div>

            <div v-else>-</div>
          </div>
        </div>
      </div>

      <FormInfo>
        <div class="flex justify-between mb-1">
          <span>Exchange rate</span>
          <span>{{ exchangeRate || "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span>Pooled Tokens</span>
          <span>{{ poolMeta ? poolMeta.tokenFull : "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span>Pooled XTZ</span>
          <span>{{ poolMeta ? poolMeta.tezFull : "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span>Your pool tokens</span>
          <span>{{ poolMeta ? poolMeta.myTokens : "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span>Your pool share</span>
          <span>{{ poolMeta ? poolMeta.myShare : "-" }}</span>
        </div>
      </FormInfo>
    </Form>

    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal"></div>
    <div class="flex justify-center text-center">
      <SubmitBtn @click="removeLiquidity" :disabled="!valid">
        <template v-if="!processing">{{ remLiqStatus }}</template>
        <template v-if="processing">
          <Loader size="large" />
        </template>
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";
import NavInvest from "@/components/NavInvest.vue";
import Loader from "@/components/Loader.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";

import BigNumber from "bignumber.js";
import { getAccount } from "@/store";
import {
  QSAsset,
  isAddressValid,
  toValidAmount,
  getBalance,
  getDexStorage,
  getContract,
  estimateTezToToken,
  estimateTezToTokenInverse,
  estimateTokenToTez,
  estimateTokenToTezInverse,
  tzToMutez,
  mutezToTz,
  estimatePrice,
  estimatePriceInverse,
  clearMem,
} from "@/core";
import { TEZOS_TOKEN } from "@/defaults";
import { useThanosWallet } from "@/taquito/tezos";

type InTokens = {
  tezos: string;
  token: string;
};

type PoolMeta = {
  tezFull: string;
  tokenFull: string;
  myShare: string;
  myTokens: string;
};

@Component({
  components: {
    NavTabs,
    NavInvest,
    Form,
    FormField,
    FormIcon,
    FormInfo,
    SubmitBtn,
    Loader,
  },
})
export default class RemoveLiquidity extends Vue {
  selectedToken: QSAsset | null = null;
  sharesToRemove = "";
  myShares: string | null = null;
  tokenLoading = false;

  inTokens: InTokens | null = null;
  poolMeta: PoolMeta | null = null;

  processing = false;
  remLiqStatus = this.defaultRemLiqStatus;

  get defaultRemLiqStatus() {
    return "Remove Liquidity";
  }

  get account() {
    return getAccount();
  }

  get valid() {
    return (
      this.selectedToken &&
      this.sharesToRemove &&
      +this.sharesToRemove > 0 &&
      this.inTokens
    );
  }

  get exchangeRate() {
    if (!this.selectedToken || !this.inTokens) {
      return null;
    }

    const price = new BigNumber(this.inTokens.tezos)
      .div(this.inTokens.token)
      .toFormat(6);

    return `1 ${this.selectedToken.name} = ${price} XTZ`;
  }

  formatNum(val: string, dec: number) {
    return new BigNumber(val).toFormat(dec);
  }

  @Watch("selectedToken")
  onSelectedTokenChange() {
    this.loadMyShares();
    this.loadPoolMetadata();
  }

  @Watch("account")
  onAccountChange() {
    this.loadMyShares();
    this.loadPoolMetadata();
  }

  async loadMyShares() {
    this.myShares = null;
    try {
      this.tokenLoading = true;
      if (this.selectedToken && this.account.pkh) {
        const dexStorage = await getDexStorage(this.selectedToken.exchange);
        const shares = await dexStorage.shares.get(this.account.pkh);
        this.myShares = shares ? shares.toString() : "0";
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
    } finally {
      this.tokenLoading = false;
    }
  }

  async loadPoolMetadata() {
    this.poolMeta = null;

    if (this.selectedToken && this.account.pkh) {
      const dexStorage = await getDexStorage(this.selectedToken.exchange);
      const myShares = await dexStorage.shares.get(this.account.pkh);

      const myShare =
        myShares && new BigNumber(myShares).div(dexStorage.totalShares);
      const myTokens =
        myShare &&
        new BigNumber(dexStorage.tokenPool)
          .times(myShare)
          .integerValue(BigNumber.ROUND_DOWN);

      this.poolMeta = {
        tezFull: `${mutezToTz(dexStorage.tezPool)} XTZ`,
        tokenFull: `${dexStorage.tokenPool} Token`,
        myShare: myShare ? `${myShare.times(100).toFormat(2)}%` : "-",
        myTokens: myTokens ? `${myTokens} Token` : "-",
      };
    }
  }

  async handleTokenSelect(token: QSAsset) {
    this.selectedToken = token;

    if (!this.sharesToRemove) {
      this.sharesToRemove = "1";
    }
    this.calcInTokens();
  }

  handleSharesToRemoveChange(amount: string) {
    this.sharesToRemove = amount;
    const isNum = /^[0-9]*$/g.test(amount);
    if (isNum) {
      this.calcInTokens();
    } else {
      this.inTokens = null;
    }
  }

  async calcInTokens() {
    this.inTokens = null;
    if (!this.selectedToken || !this.sharesToRemove) return;

    const dexStorage = await getDexStorage(this.selectedToken.exchange);
    const tokenPerShare = new BigNumber(dexStorage.tokenPool)
      .div(dexStorage.totalShares)
      .integerValue(BigNumber.ROUND_DOWN);
    const tezPerShare = new BigNumber(dexStorage.tezPool)
      .div(dexStorage.totalShares)
      .integerValue(BigNumber.ROUND_DOWN);

    const tezAmount = mutezToTz(tezPerShare.times(this.sharesToRemove));
    const tokenAmount = tokenPerShare.times(this.sharesToRemove);
    const tezos = toValidAmount(tezAmount);
    const token = toValidAmount(tokenAmount);
    this.inTokens = tezos && token ? { tezos, token } : null;
  }

  async removeLiquidity() {
    if (this.processing) return;
    this.processing = true;
    try {
      const tezos = await useThanosWallet();
      const me = await tezos.wallet.pkh();

      const shares = new BigNumber(this.sharesToRemove!);
      const selTk = this.selectedToken!;

      const dexStorage = await getDexStorage(selTk.exchange);
      const myShares = await dexStorage.shares.get(this.account.pkh);

      if (!myShares || shares.isGreaterThan(myShares)) {
        throw new Error("Not Enough Shares");
      }

      const minTezos = tzToMutez(this.inTokens!.tezos);
      const minToken = new BigNumber(this.inTokens!.token);

      const dexContract = await tezos.wallet.at(selTk.exchange);
      const operation = await dexContract.methods
        .use(
          5,
          "divestLiquidity",
          shares.toNumber(),
          minTezos.toNumber(),
          minToken.toNumber()
        )
        .send();
      await operation.confirmation();

      this.remLiqStatus = "Success!";
      this.refresh();
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.remLiqStatus =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
          : "Something went wrong";
    }
    this.processing = false;

    await new Promise((res) => setTimeout(res, 5000));
    this.remLiqStatus = this.defaultRemLiqStatus;
  }

  refresh() {
    clearMem();
    this.loadMyShares();
    this.loadPoolMetadata();
    this.calcInTokens();
  }
}
</script>

<style lang="postcss" scoped>
.field {
  @apply h-20 px-3 flex items-stretch;
  background: #2a3248;
}

.fieldval {
  @apply text-base font-light;
}

@screen xs {
  .field {
    @apply px-6 h-32;
  }

  .field-extend {
    @apply px-6 h-32;
  }

  .fieldval {
    @apply text-lg;
  }
}

.label {
  color: #f6cc5b;
}
</style>
