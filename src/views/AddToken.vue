<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <Form :style="processing && 'pointer-events:none'">
      <NavInvest />

      <div class="relative">
        <FormField
          placeholder="KT1v7h3s..."
          label="Token address"
          :withSelect="false"
          v-model="tokenAddress"
          v-on:input="tokenAddress = $event.target.value"
          :spellcheck="false"
          :extrabutton="true"
        />

        <div class="absolute right-0 top-0 bottom-0 flex items-center pr-3">
          <div
            class="flex flex-col items-stretch text-white border-accent border-2 rounded-3px text-sm sm:text-base whitespace-no-wrap"
          >
            <button
              class="text-left font-medium tracking-wider px-3 py-1 focus:outline-none"
              :class="
                tokenType === 'FA1.2'
                  ? 'bg-accent text-black'
                  : 'hover:text-accent'
              "
              @click="() => setTokenType('FA1.2')"
            >
              FA 1.2
            </button>
            <button
              class="text-left font-medium tracking-wider px-3 py-1 focus:outline-none"
              :class="
                tokenType === 'FA2'
                  ? 'bg-accent text-black'
                  : 'hover:text-accent'
              "
              @click="() => setTokenType('FA2')"
            >
              FA 2
            </button>
          </div>
        </div>
      </div>

      <template v-if="tokenType === 'FA2'">
        <FormIcon>
          <img :src="require('@/assets/plus.svg')" />
        </FormIcon>

        <FormField
          placeholder="0"
          label="Token ID"
          :withSelect="false"
          v-model="tokenId"
          v-on:input="
            tokenId = !isNaN(parseInt($event.target.value))
              ? parseInt($event.target.value)
              : ''
          "
          :spellcheck="false"
        />
      </template>

      <FormIcon>
        <img :src="require('@/assets/arrow-down.svg')" />
      </FormIcon>

      <FormField
        placeholder="0.0"
        label="Tezos Deposit"
        :withTezos="false"
        :onlyTezos="true"
        :subLabel="tezBalance ? `Balance: ${tezBalance}` : ''"
        :isLoading="tezLoading"
        v-model="tezAmount"
        @input="(e) => handleTezAmountChange(e.target.value)"
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
        @input="(e) => handleTokenAmountChange(e.target.value)"
      />

      <FormInfo>
        <div class="flex justify-between mb-1">
          <span>Exchange rate</span>
          <span>{{ exchangeRate || "-" }}</span>
        </div>
      </FormInfo>
    </Form>

    <div
      class="mx-auto mt-8 mb-8 text-sm font-normal text-center text-lightgray"
    ></div>
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
import { loadTokens, getAccount, useWallet } from "@/store";
import {
  QSAsset,
  isAddressValid,
  isKTAddress,
  toValidAmount,
  getBalance,
  getNewTokenData,
  getDexStorage,
  getStoragePure,
  getContract,
  getNetwork,
  estimateInTokens,
  estimateInTezos,
  tzToMutez,
  mutezToTz,
  clearMem,
  approveToken,
  QSTokenType,
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
  tokenDecimals = 0;
  tokenLoading = false;

  processing = false;
  addTokenStatus = this.defaultAddTokenStatus;

  tokenType = QSTokenType.FA1_2;
  tokenId = 0;

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
      Number(
        new BigNumber(this.tokenAmount).toFormat(this.tokenDecimals, {
          decimalSeparator: ".",
        })
      ) === +this.tokenAmount
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

  setTokenType(tokenType: QSTokenType) {
    this.tokenType = tokenType;
  }

  created() {
    this.loadTezBalance();
  }

  @Watch("tezToken")
  onTezTokenChange() {
    this.loadTezBalance();
  }

  @Watch("tokenType")
  onTokenTypeChange() {
    this.loadTokenData();
  }

  @Watch("tokenAddress")
  onTokenAddressChange() {
    this.loadTokenData();
  }

  @Watch("tokenId")
  onTokenIdChange() {
    this.loadTokenData();
  }

  @Watch("account")
  onAccountChange() {
    this.loadTezBalance();
    this.loadTokenData();
  }

  async loadTezBalance() {
    this.tezBalance = null;
    try {
      if (this.tezToken && this.account.pkh) {
        const balance = await getBalance(this.account.pkh, this.tezToken);
        this.tezBalance = balance.toFixed();
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
    }
  }

  async loadTokenData() {
    this.tokenBalance = null;
    if (isKTAddress(this.tokenAddress) && this.account.pkh) {
      try {
        const { bal, decimals } = await getNewTokenData(
          this.account.pkh,
          this.tokenType,
          this.tokenAddress,
          this.tokenId ? +this.tokenId : 0
        );
        this.tokenBalance = bal.div(new BigNumber(10).pow(decimals)).toFixed();
        this.tokenDecimals = decimals;
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }
        this.tokenBalance = "?";
        this.tokenDecimals = 0;
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
      const tezos = await useWallet();
      const me = await tezos.wallet.pkh();

      const tezTk = this.tezToken!;
      const tezAmount = new BigNumber(this.tezAmount);
      const tokenAmount = new BigNumber(this.tokenAmount)
        .multipliedBy(new BigNumber(10).pow(this.tokenDecimals))
        .integerValue();
      const tokenId = this.tokenId ? +this.tokenId : 0;

      const tokenData = await getNewTokenData(
        me,
        this.tokenType,
        this.tokenAddress,
        tokenId
      );

      const toCheck = [
        {
          promise: getBalance(me, tezTk),
          amount: tezAmount,
        },
        {
          promise: Promise.resolve(tokenData).then(({ bal }) => bal),
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

      const { fa1_2FactoryContract, fa2FactoryContract } = getNetwork();
      if (
        (this.tokenType === "FA1.2" && !fa1_2FactoryContract) ||
        (this.tokenType === "FA2" && !fa2FactoryContract)
      ) {
        throw new Error("Factory contract for network not found");
      }

      const factoryContractAddres =
        this.tokenType === "FA1.2"
          ? fa1_2FactoryContract!
          : fa2FactoryContract!;

      const [facContract, tokenContract] = await Promise.all([
        tezos.wallet.at(factoryContractAddres),
        tezos.wallet.at(this.tokenAddress),
      ]);

      const tokenAmountNat = tokenAmount
        .integerValue(BigNumber.ROUND_DOWN)
        .toFixed();

      const batch = tezos.wallet
        .batch([])
        .withTransfer(
          approveToken(
            {
              tokenType: this.tokenType,
              fa2TokenId: tokenId
            },
            tokenContract,
            me,
            factoryContractAddres,
            tokenAmountNat
          ).toTransferParams()
        )
        .withTransfer(
          facContract.methods
            .launchExchange(
              ...(this.tokenType === "FA1.2"
                ? [this.tokenAddress]
                : [this.tokenAddress, tokenId]),
              tokenAmountNat
            )
            .toTransferParams({ amount: tezAmount.toFixed() as any })
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
    this.loadTokenData();
    loadTokens();
  }
}
</script>
