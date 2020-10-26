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

    <div class="mx-auto mt-8 mb-8 text-sm font-normal text-center text-text"></div>
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
import { getAccount, useThanosWallet } from "@/store";
import {
  QSAsset,
  isAddressValid,
  toValidAmount,
  getBalance,
  getDexStorage,
  getDexShares,
  getContract,
  estimateShares,
  estimateSharesInverse,
  estimateInTokens,
  estimateInTezos,
  estimateToTezos,
  tzToMutez,
  mutezToTz,
  clearMem,
} from "@/core";
import { XTZ_TOKEN } from "@/core/defaults";

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
  tezToken: QSAsset | null = XTZ_TOKEN;
  tezAmount = "";
  tezBalance: string | null = null;
  tezLoading = false;

  selectedToken: QSAsset | null = null;
  tokenAmount = "";
  tokenBalance: string | null = null;
  tokenLoading = false;

  poolMeta: PoolMeta | null = null;
  dexAddress: string | null = null;

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
      const myShares = await getDexShares(this.account.pkh, this.selectedToken.exchange);
      const dexStorage = await getDexStorage(this.selectedToken.exchange);

      const myShare =
        myShares && new BigNumber(myShares).div(dexStorage.totalSupply);
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
    this.dexAddress = token.exchange;
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
      setTimeout(() => this.calcTezAmount(), 0);
    } else {
      this.tezAmount = "";
    }
  }

  async calcTokenAmount() {
    if (!this.selectedToken) return;

    const dexStorage = await getDexStorage(this.selectedToken.exchange);
    const shares = estimateShares(this.tezAmount, dexStorage);
    const amount = estimateInTokens(shares, dexStorage);

    this.tokenAmount = toValidAmount(amount);
  }

  async calcTezAmount() {
    if (!this.selectedToken) return;

    const dexStorage = await getDexStorage(this.selectedToken.exchange);
    const shares = estimateSharesInverse(this.tokenAmount, dexStorage);
    const amount = estimateInTezos(shares, dexStorage);

    this.tezAmount = toValidAmount(amount);
  }

  async addLiquidity() {
    if (this.processing) return;
    this.processing = true;
    try {
      const tezos = await useThanosWallet();
      const me = await tezos.wallet.pkh();

      const tezTk = this.tezToken!;
      const selTk = this.selectedToken!;
      const initialTezAmount = new BigNumber(this.tezAmount);
      const initialTokenAmount = new BigNumber(this.tokenAmount);

      const dexStorage = await getDexStorage(selTk.exchange);
      const tezShares = estimateShares(initialTezAmount, dexStorage);
      const tokensShares = estimateSharesInverse(initialTokenAmount, dexStorage);
      // console.info(JSON.parse(JSON.stringify({ tezShares, tokensShares })))
      const tezAmount = estimateInTezos(BigNumber.max(tezShares, tokensShares), dexStorage);
      const shares = estimateShares(tezAmount, dexStorage);
      const tokenAmount = estimateInTokens(shares, dexStorage);

      const toCheck = [
        {
          token: selTk,
          amount: tokenAmount,
        },
        {
          token: tezTk,
          amount: tezAmount,
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
            .approve(selTk.exchange, tokenAmount.toNumber())
            .toTransferParams()
        )
        .withTransfer(
          dexContract.methods
            .use(4, "investLiquidity", shares.toNumber())
            .toTransferParams({ amount: tezAmount.toNumber() })
        );

      const operation = await batch.send();
      await operation.confirmation();

      this.addLiqStatus = "Success!";
      this.refresh();
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.addLiqStatus =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
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
