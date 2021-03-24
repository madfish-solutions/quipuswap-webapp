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
        @input="(e) => handleSharesToRemoveChange(e.target.value)"
        @selectToken="handleTokenSelect"
        :selectedToken="selectedToken"
      />

      <FormIcon>
        <img :src="require('@/assets/arrow-down.svg')" />
      </FormIcon>

      <div class="-mx-3 shadow-lg xs:-mx-4">
        <div class="relative field rounded-3px">
          <div class="flex flex-col justify-start flex-1 py-6">
            <div class="w-full mb-1 font-light label xs:mb-2 sm:text-lg">
              Output
              <span class="text-sm">(estimated)</span>
            </div>

            <div v-if="inTokens" class="flex flex-col fieldval">
              <div class="mb-1">
                <span class="mr-1 opacity-75">+</span>
                <span class="tracking-wide">
                  {{ formatNum(inTokens.tezos, 6) }}
                </span>
                <span class="ml-1 text-sm opacity-90">XTZ</span>
              </div>

              <div class="mb-1">
                <span class="mr-1 opacity-75">+</span>
                <span class="tracking-wide">
                  {{ formatNum(inTokens.token, selectedToken.decimals) }}
                </span>
                <span class="ml-1 text-sm opacity-90">{{
                  selectedToken.name
                }}</span>
              </div>
            </div>

            <div v-else>-</div>
          </div>
        </div>
      </div>

      <FormInfo class="overflow-x-auto whitespace-no-wrap">
        <div class="flex justify-between mb-1">
          <span class="mr-2">Dex contract</span>
          <span class="font-mono text-gray-400">{{ dexAddress || "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span class="mr-2">Exchange rate</span>
          <span>{{ exchangeRate || "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span class="mr-2">Pooled Tokens</span>
          <span>{{ poolMeta ? poolMeta.tokenFull : "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span class="mr-2">Pooled XTZ</span>
          <span>{{ poolMeta ? poolMeta.tezFull : "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span class="mr-2">Your pool tokens</span>
          <span>{{ poolMeta ? poolMeta.myTokens : "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span class="mr-2">Your pool share</span>
          <span>{{ poolMeta ? poolMeta.myShare : "-" }}</span>
        </div>
      </FormInfo>
    </Form>

    <div
      class="mx-auto mt-8 mb-8 text-sm font-normal text-center text-lightgray"
    ></div>
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
import { getAccount, useWallet } from "@/store";
import {
  QSAsset,
  isAddressValid,
  toValidAmount,
  getBalance,
  getDexStorage,
  getDexShares,
  getContract,
  estimateInTokens,
  estimateInTezos,
  tzToMutez,
  mutezToTz,
  clearMem,
  toNat,
  fromNat,
} from "@/core";
import { XTZ_TOKEN } from "@/core/defaults";

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
  dexAddress: string | null = null;

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
        const shares = await getDexShares(
          this.account.pkh,
          this.selectedToken.exchange
        );
        if (!shares) {
          this.myShares = "0";
        } else {
          this.myShares = shares.unfrozen.toFixed();
        }
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
      const myShares = await getDexShares(
        this.account.pkh,
        this.selectedToken.exchange
      );
      const dexStorage = await getDexStorage(this.selectedToken.exchange);

      const myShare =
        myShares &&
        new BigNumber(myShares.unfrozen).div(dexStorage.totalSupply);
      const myTokens =
        myShare &&
        fromNat(
          new BigNumber(dexStorage.tokenPool)
            .times(myShare)
            .integerValue(BigNumber.ROUND_DOWN),
          this.selectedToken
        );

      this.poolMeta = {
        tezFull: `${mutezToTz(dexStorage.tezPool)} XTZ`,
        tokenFull: `${fromNat(dexStorage.tokenPool, this.selectedToken)} ${
          this.selectedToken.name
        }`,
        myShare: myShare && !myShare.isNaN() ? `${myShare.times(100).toFormat(2)}%` : "-",
        myTokens: myTokens && !myTokens.isNaN() ? `${myTokens} ${this.selectedToken.name}` : "-",
      };
    }
  }

  async handleTokenSelect(token: QSAsset) {
    this.selectedToken = token;
    this.dexAddress = token.exchange;

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

    const tezAmount = estimateInTezos(this.sharesToRemove, dexStorage);
    const tokenAmount = estimateInTokens(
      this.sharesToRemove,
      dexStorage,
      this.selectedToken
    );

    const tezos = toValidAmount(tezAmount);
    const token = toValidAmount(tokenAmount);
    this.inTokens = tezos && token ? { tezos, token } : null;
  }

  async removeLiquidity() {
    if (this.processing) return;
    this.processing = true;
    try {
      const tezos = await useWallet();
      const me = await tezos.wallet.pkh();

      const shares = new BigNumber(this.sharesToRemove!);
      const selTk = this.selectedToken!;

      const dexStorage = await getDexStorage(selTk.exchange);
      const mySharesPure = await getDexShares(this.account.pkh, selTk.exchange);
      let myShares: string | undefined;
      if (mySharesPure) {
        myShares = mySharesPure.unfrozen.toFixed();
      }

      if (!myShares || shares.isGreaterThan(myShares)) {
        throw new Error("Not Enough Shares");
      }

      const minTezos = tzToMutez(this.inTokens!.tezos);
      const minToken = toNat(this.inTokens!.token, selTk);

      const dexContract = await tezos.wallet.at(selTk.exchange);
      const operation = await dexContract.methods
        .use(
          "divestLiquidity",
          minTezos.toFixed(),
          minToken.toFixed(),
          shares.toFixed()
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
  @apply px-3 flex items-stretch;
  min-height: 5rem;
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
