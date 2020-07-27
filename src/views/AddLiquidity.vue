<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <Form :style="processing && 'pointer-events:none'">
      <NavInvest />

      <FormField
        placeholder="0.0"
        label="Tezos Deposit"
        :withTezos="false"
        :onlyTezos="true"
        :subLabel="tezBalance ? `Balance: ${tezBalance}` : ''"
        :isLoading="tezLoading"
        v-model="tezAmount"
        @input="e => handleTezAmountChange(e.target.value)"
        :selectedToken="tezToken"
      />

      <FormIcon>
        <img :src="require('@/assets/plus.svg')" />
      </FormIcon>

      <FormField
        placeholder="0.0"
        label="Token Deposit"
        :withTezos="false"
        :subLabel="tokenBalance ? `Balance: ${tokenBalance}` : ''"
        :isLoading="tokenLoading"
        v-model="tokenAmount"
        @input="e => handleTokenAmountChange(e.target.value)"
        @selectToken="handleTokenSelect"
        :selectedToken="selectedToken"
      />

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
      <SubmitBtn @click="addLiquidity" :disabled="!valid">
        <template v-if="!processing">{{ addLiqStatus }}</template>
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
export default class AddLiquidity extends Vue {
  tezToken: QSAsset | null = TEZOS_TOKEN;
  tezAmount = "";
  tezBalance: string | null = null;
  tezLoading = false;

  selectedToken: QSAsset | null = null;
  tokenAmount = "";
  tokenBalance: string | null = null;
  tokenLoading = false;

  poolMeta: PoolMeta | null = null;

  processing = false;
  addLiqStatus = this.defaultAddLiqStatus;

  get defaultAddLiqStatus() {
    return "Add Liquidity";
  }

  get account() {
    return getAccount();
  }

  get valid() {
    return (
      this.tezToken &&
      this.selectedToken &&
      [this.tezAmount, this.tokenAmount].every((a) => a && +a > 0)
    );
  }

  get exchangeRate() {
    if (
      !this.tezToken ||
      !this.selectedToken ||
      !this.tezAmount ||
      !this.tokenAmount
    ) {
      return null;
    }

    const price = new BigNumber(this.tezAmount)
      .div(this.tokenAmount)
      .toFormat(6);

    return `1 ${this.selectedToken.name} = ${price} XTZ`;
  }

  created() {
    this.loadTezBalance();
  }

  @Watch("tezToken")
  onTezTokenChange() {
    this.loadTezBalance();
  }

  @Watch("selectedToken")
  onSelectedTokenChange() {
    this.loadTokenBalance();
    this.loadPoolMetadata();
  }

  @Watch("account")
  onAccountChange() {
    this.loadTezBalance();
    this.loadTokenBalance();
    this.loadPoolMetadata();
  }

  async loadTezBalance() {
    this.tezBalance = null;
    try {
      if (this.tezToken && this.account.pkh) {
        const balance = await getBalance(this.account.pkh, this.tezToken);
        this.tezBalance = balance.toString();
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
    }
  }

  async loadTokenBalance() {
    this.tokenBalance = null;
    try {
      if (this.selectedToken && this.account.pkh) {
        const balance = await getBalance(this.account.pkh, this.selectedToken);
        this.tokenBalance = balance.toString();
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
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

    if (!this.tezAmount) {
      this.tezAmount = "1";
    }

    this.tokenLoading = true;
    await getDexStorage(token.exchange);
    this.tokenLoading = false;

    this.calcTokenAmount();
  }

  handleTezAmountChange(amount: string) {
    this.tezAmount = amount;
    const isNum = /^[0-9.]*$/g.test(amount);
    if (isNum) {
      this.calcTokenAmount();
    } else {
      this.tokenAmount = "";
    }
  }

  handleTokenAmountChange(amount: string) {
    this.tokenAmount = amount;
    const isNum = /^[0-9]*$/g.test(amount);
    if (isNum) {
      this.calcTezAmount();
    } else {
      this.tezAmount = "";
    }
  }

  async calcTokenAmount() {
    if (!this.selectedToken) return;

    const amount = estimatePrice(
      this.tezAmount,
      await getDexStorage(this.selectedToken.exchange)
    );
    this.tokenAmount = toValidAmount(amount);
  }

  async calcTezAmount() {
    if (!this.selectedToken) return;

    const amount = estimatePriceInverse(
      this.tokenAmount,
      await getDexStorage(this.selectedToken.exchange)
    );
    this.tezAmount = toValidAmount(amount);
  }

  async addLiquidity() {
    this.processing = true;

    try {
      const tezos = await useThanosWallet();
      const me = await tezos.wallet.pkh();

      const tezTk = this.tezToken!;
      const selTk = this.selectedToken!;
      const tkAmn = +this.tokenAmount!;

      const dexStorage = await getDexStorage(selTk.exchange);
      const tokenPerShare = new BigNumber(dexStorage.tokenPool)
        .div(dexStorage.totalShares)
        .integerValue(BigNumber.ROUND_DOWN);
      const tezPerShare = new BigNumber(dexStorage.tezPool)
        .div(dexStorage.totalShares)
        .integerValue(BigNumber.ROUND_DOWN);

      const shares = new BigNumber(tkAmn)
        .div(tokenPerShare)
        .integerValue(BigNumber.ROUND_DOWN);
      const mutezAmount = shares.times(tezPerShare);

      const toCheck = [
        {
          token: selTk,
          amount: tkAmn,
        },
        {
          token: tezTk,
          amount: mutezToTz(mutezAmount),
        },
      ];
      for (const { token, amount } of toCheck) {
        let bal: BigNumber | undefined;
        try {
          bal = await getBalance(me, token);
        } catch (_err) {}
        if (bal && bal.isLessThan(amount)) {
          throw new Error("Not Enough Funds");
        }
      }

      const [tokenContract, dexContract] = await Promise.all([
        tezos.wallet.at(selTk.id),
        tezos.wallet.at(selTk.exchange),
      ]);

      const batch = tezos.wallet
        .batch([])
        .withTransfer(
          tokenContract.methods
            .approve(selTk.exchange, tkAmn)
            .toTransferParams()
        )
        .withTransfer(
          dexContract.methods
            .use(4, "investLiquidity", shares.toNumber())
            .toTransferParams({ amount: mutezToTz(mutezAmount).toNumber() })
        );

      const operation = await batch.send();
      await operation.confirmation();

      this.addLiqStatus = "Success!";
      this.refresh();
    } catch (err) {
      console.error(err);
      this.addLiqStatus =
        err.message && err.message.length < 25
          ? err.message
          : "Something went wrong";
    }
    this.processing = false;

    await new Promise((res) => setTimeout(res, 5000));
    this.addLiqStatus = this.defaultAddLiqStatus;
  }

  refresh() {
    clearMem();
    this.loadTezBalance();
    this.loadTokenBalance();
    this.loadPoolMetadata();
    this.calcTokenAmount();
  }
}
</script>
