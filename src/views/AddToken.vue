<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <Form :style="processing && 'pointer-events:none'">
      <NavInvest />

      <FormField
        placeholder="KT1v7h3s..."
        label="Token address"
        :withSelect="false"
        v-model="tokenAddress"
        v-on:input="tokenAddress = $event.target.value"
        :spellcheck="false"
      />

      <FormIcon>
        <p class="text-center">Please, provide an address of a valid FA1.2 contract.</p>
      </FormIcon>

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
        :withSelect="false"
        :subLabel="tokenBalance ? `Balance: ${tokenBalance}` : ''"
        :isLoading="tokenLoading"
        v-model="tokenAmount"
        @input="e => handleTokenAmountChange(e.target.value)"
      />

      <FormInfo>
        <div class="flex justify-between mb-1">
          <span>Exchange rate</span>
          <span>{{ exchangeRate || "-" }}</span>
        </div>
      </FormInfo>
    </Form>

    <div class="mx-auto mt-8 mb-8 text-sm font-normal text-center text-lightgray"></div>
    <div class="flex justify-center text-center">
      <SubmitBtn @click="addToken" :disabled="!valid">
        <template v-if="!processing">{{ addTokenStatus }}</template>
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
import { loadTokens, getAccount, useThanosWallet } from "@/store";
import {
  QSAsset,
  isAddressValid,
  isKTAddress,
  toValidAmount,
  getBalance,
  getNewTokenBalance,
  getDexStorage,
  getStoragePure,
  getContract,
  getNetwork,
  estimateInTokens,
  estimateInTezos,
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
export default class AddToken extends Vue {
  tokenAddress = "";

  tezToken: QSAsset | null = XTZ_TOKEN;
  tezAmount = "";
  tezBalance: string | null = null;
  tezLoading = false;

  tokenAmount = "";
  tokenBalance: string | null = null;
  tokenLoading = false;

  processing = false;
  addTokenStatus = this.defaultAddTokenStatus;

  get defaultAddTokenStatus() {
    return "Add new token";
  }

  get account() {
    return getAccount();
  }

  get valid() {
    return (
      this.tezToken &&
      isKTAddress(this.tokenAddress) &&
      [this.tezAmount, this.tokenAmount].every((a) => a && +a > 0) &&
      Number.isInteger(+this.tokenAmount)
    );
  }

  get exchangeRate() {
    if (!this.valid) {
      return null;
    }

    const price = new BigNumber(this.tezAmount)
      .div(this.tokenAmount)
      .toFormat(6);

    return `1 Token = ${price} XTZ`;
  }

  created() {
    this.loadTezBalance();
  }

  @Watch("tezToken")
  onTezTokenChange() {
    this.loadTezBalance();
  }

  @Watch("tokenAddress")
  onTokenAddressChange() {
    this.loadTokenBalance();
  }

  @Watch("account")
  onAccountChange() {
    this.loadTezBalance();
    this.loadTokenBalance();
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
      if (isKTAddress(this.tokenAddress) && this.account.pkh) {
        try {
          const bal = await getNewTokenBalance(
            this.account.pkh,
            this.tokenAddress
          );
          this.tokenBalance = bal.toString();
        } catch (_err) {
          this.tokenBalance = "?";
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
    }
  }

  handleTezAmountChange(amount: string) {
    this.tezAmount = amount;
  }

  handleTokenAmountChange(amount: string) {
    this.tokenAmount = amount;
  }

  async addToken() {
    if (this.processing) return;
    this.processing = true;
    try {
      const tezos = await useThanosWallet();
      const me = await tezos.wallet.pkh();

      const tezTk = this.tezToken!;
      const tezAmount = new BigNumber(this.tezAmount);
      const tokenAmount = new BigNumber(this.tokenAmount);

      const toCheck = [
        {
          promise: getBalance(me, tezTk),
          amount: tezAmount,
        },
        {
          promise: getNewTokenBalance(me, this.tokenAddress),
          amount: tokenAmount,
        },
      ];
      for (const { promise, amount } of toCheck) {
        let bal: BigNumber | undefined;
        try {
          bal = await promise;
        } catch (_err) {}
        if (bal && bal.isLessThan(amount)) {
          throw new Error("Not Enough Funds");
        }
      }

      const { factoryContract } = getNetwork();
      if (!factoryContract) {
        throw new Error("Factory contract for network not found");
      }

      const [facContract, tokenContract] = await Promise.all([
        tezos.wallet.at(factoryContract),
        tezos.wallet.at(this.tokenAddress),
      ]);

      if (typeof tokenContract.methods.approve !== "function") {
        throw new Error("Invalid token contract");
      }

      const batch = tezos.wallet
        .batch([])
        .withTransfer(
          tokenContract.methods
            .approve(factoryContract, tokenAmount.toNumber())
            .toTransferParams()
        )
        .withTransfer(
          facContract.methods
            .launchExchange(this.tokenAddress, tokenAmount.toNumber())
            .toTransferParams({ amount: tezAmount.toNumber() })
        );

      const operation = await batch.send();
      await operation.confirmation();

      this.addTokenStatus = "Success!";
      this.refresh();
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.addTokenStatus =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
          : "Something went wrong";
    }
    this.processing = false;

    await new Promise((res) => setTimeout(res, 5000));
    this.addTokenStatus = this.defaultAddTokenStatus;
  }

  refresh() {
    clearMem();
    this.loadTezBalance();
    this.loadTokenBalance();
    loadTokens();
  }
}
</script>
