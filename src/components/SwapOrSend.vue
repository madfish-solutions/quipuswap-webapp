<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <Form :style="swapping && 'pointer-events:none'">
      <FormField
        placeholder="0.0"
        label="Input"
        v-model="inputAmount"
        :subLabel="inputBalance ? `Balance: ${inputBalance}` : ''"
        :isLoading="inputLoading"
        @input="e => handleInputAmountChange(e.target.value)"
        @selectToken="handleInputSelect"
        :selectedToken="inputToken"
      />

      <FormIcon>
        <img src="@/assets/arrow-down.svg" />
      </FormIcon>

      <FormField
        placeholder="0.0"
        label="Output"
        v-model="outputAmount"
        :isLoading="outputLoading"
        @input="e => handleOutputAmountChange(e.target.value)"
        @selectToken="handleOutputSelect"
        :selectedToken="outputToken"
      />

      <template v-if="send">
        <FormIcon>
          <img class="inline" src="@/assets/arrow-down.svg" />
        </FormIcon>

        <FormField
          label="Recipient Address"
          placeholder="tz1v7h3s..."
          :withSelect="false"
          v-model="recipientAddress"
          @input="e => (recipientAddress = e.target.value)"
          :spellcheck="false"
        />
      </template>

      <FormInfo>
        <div class="flex justify-between mb-1">
          <span>Exchange rate</span>
          <span>{{ exchangeRate || "-" }}</span>
        </div>

        <div class="flex mb-1">
          <span>Slippage tolerance</span>
          <span class="flex-1"></span>
          <button
            v-for="percentage in slippagePercentages"
            :key="percentage"
            class="py-px px-2 ml-2 text-xs rounded-md shadow-xs focus:outline-none"
            :class="
              activeSlippagePercentage === percentage ? 'bg-alphawhite' : ''
            "
            v-on:click="activeSlippagePercentage = percentage"
          >
            {{ percentage }}
            <span class="opacity-75">%</span>
          </button>
        </div>

        <div class="flex justify-between mb-1">
          <span>Minimum received</span>
          <span>
            {{
            minimumReceived ? `${minimumReceived} ${outputToken.name}` : "-"
            }}
          </span>
        </div>
      </FormInfo>
    </Form>

    <div class="mt-8 flex justify-center align-center text-center">
      <SubmitBtn :disabled="!canSwap" @click="swap">
        <template v-if="!swapping">{{ swapStatus }}</template>
        <template v-if="swapping">
          <Loader size="large" />
        </template>
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";
import Form, { FormIcon, FormField, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import Loader from "@/components/Loader.vue";

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
  clearMem,
} from "@/core";
import { TEZOS_TOKEN } from "@/defaults";
import { useThanosWallet } from "@/taquito/tezos";

@Component({
  components: {
    NavTabs,
    Form,
    FormIcon,
    FormField,
    FormInfo,
    SubmitBtn,
    Loader,
  },
})
export default class SwapOrSend extends Vue {
  @Prop({ default: false }) send?: boolean;

  inputToken: QSAsset | null = TEZOS_TOKEN;
  inputAmount = "";
  inputBalance: string | null = null;
  inputLoading = false;

  outputToken: QSAsset | null = null;
  outputAmount = "";
  outputLoading = false;

  recipientAddress: string = "";

  slippagePercentages = [0.5, 1, 3];
  activeSlippagePercentage = 1;

  swapping = false;
  swapStatus = this.defaultSwapStatus;

  get defaultSwapStatus() {
    return this.send ? "Send" : "Swap";
  }

  get account() {
    return getAccount();
  }

  get exchangeRate() {
    if (
      !this.inputToken ||
      !this.outputToken ||
      !this.inputAmount ||
      !this.outputAmount
    ) {
      return null;
    }

    const price = new BigNumber(this.inputAmount)
      .div(this.outputAmount)
      .toFormat(this.inputToken.type === "token" ? 0 : 6);
    return `1 ${this.outputToken.name} = ${price} ${this.inputToken.name}`;
  }

  get minimumReceived() {
    if (!this.outputToken || !this.outputAmount) return null;
    const base = new BigNumber(100)
      .minus(this.activeSlippagePercentage)
      .div(100)
      .times(this.outputAmount);

    return this.outputToken.type === "xtz"
      ? base.toFixed(6, BigNumber.ROUND_DOWN)
      : base.integerValue(BigNumber.ROUND_DOWN).toString();
  }

  get canSwap() {
    const inAndOutValid =
      this.inputToken &&
      this.outputToken &&
      [this.inputAmount, this.outputAmount].every((a) => a && +a > 0);
    return this.send
      ? inAndOutValid && isAddressValid(this.recipientAddress)
      : inAndOutValid;
  }

  created() {
    this.loadInputBalance();
  }

  @Watch("inputToken")
  onInputTokenChange() {
    this.loadInputBalance();
  }

  @Watch("account")
  onAccountChange() {
    this.loadInputBalance();
  }

  async loadInputBalance() {
    this.inputBalance = null;
    try {
      if (this.inputToken && this.account.pkh) {
        const balance = await getBalance(this.account.pkh, this.inputToken);
        this.inputBalance = balance.toString();
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
    }
  }

  async handleInputSelect(token: QSAsset) {
    this.inputToken = token;

    if (this.outputToken && token.id === this.outputToken.id) {
      this.outputToken = null;
      this.outputAmount = "";
    }

    if (token.type === "token") {
      this.inputLoading = true;
      await getDexStorage(token.exchange);
      this.inputLoading = false;
    }

    this.calcOutputAmount();
  }

  async handleOutputSelect(token: QSAsset) {
    this.outputToken = token;

    if (this.inputToken) {
      if (token.id === this.inputToken.id) {
        this.inputToken = null;
      } else if (!this.inputAmount) {
        this.inputAmount = "1";
      }
    }

    if (token.type === "token") {
      this.outputLoading = true;
      await getDexStorage(token.exchange);
      this.outputLoading = false;
    }
    this.calcOutputAmount();
  }

  handleInputAmountChange(amount: string) {
    this.inputAmount = amount;
    const isNum = /^[0-9.]*$/g.test(amount);
    if (isNum) {
      this.calcOutputAmount();
    } else {
      this.outputAmount = "";
    }
  }

  handleOutputAmountChange(amount: string) {
    this.outputAmount = amount;
    const isNum = /^[0-9]*$/g.test(amount);
    if (isNum) {
      this.calcInputAmount();
    } else {
      this.inputAmount = "";
    }
  }

  async calcOutputAmount() {
    if (!this.inputToken || !this.outputToken) return;

    const inType = this.inputToken.type;
    const outType = this.outputToken.type;

    let amount: BigNumber | undefined;
    switch (true) {
      case inType === "xtz" && outType === "token":
        amount = estimateTezToToken(
          this.inputAmount,
          await getDexStorage(this.outputToken.exchange)
        );
        break;

      case inType === "token" && outType === "xtz":
        amount = estimateTokenToTez(
          this.inputAmount,
          await getDexStorage(this.inputToken.exchange)
        );
        break;

      case inType === "token" && outType === "token":
        amount = estimateTezToToken(
          await estimateTokenToTez(
            this.inputAmount,
            await getDexStorage(this.inputToken.exchange)
          ),
          await getDexStorage(this.outputToken.exchange)
        );
        break;
    }

    this.outputAmount = toValidAmount(amount);
  }

  async calcInputAmount() {
    if (!this.inputToken || !this.outputToken) return;

    const inType = this.inputToken.type;
    const outType = this.outputToken.type;

    let amount: BigNumber | undefined;
    switch (true) {
      case inType === "xtz" && outType === "token":
        amount = estimateTezToTokenInverse(
          this.outputAmount,
          await getDexStorage(this.outputToken.exchange)
        );
        break;

      case inType === "token" && outType === "xtz":
        amount = estimateTokenToTezInverse(
          this.outputAmount,
          await getDexStorage(this.inputToken.exchange)
        );
        break;

      case inType === "token" && outType === "token":
        amount = estimateTokenToTezInverse(
          await estimateTezToTokenInverse(
            this.outputAmount,
            await getDexStorage(this.outputToken.exchange)
          ),
          await getDexStorage(this.inputToken.exchange)
        );
        break;
    }

    this.inputAmount = toValidAmount(amount);
  }

  async swap() {
    this.swapping = true;

    try {
      const tezos = await useThanosWallet();
      const me = await tezos.wallet.pkh();

      const recipient = this.send ? this.recipientAddress : me;

      const inTk = this.inputToken!;
      const outTk = this.outputToken!;
      const inpAmn = +this.inputAmount!;
      const minOut = +this.minimumReceived!;

      let bal: BigNumber | undefined;
      try {
        bal = await getBalance(me, inTk);
      } catch (_err) {}
      if (bal && bal.isLessThan(inpAmn)) {
        throw new Error("Not Enough Funds");
      }

      if (inTk.type === "xtz" && outTk.type === "token") {
        const contract = await tezos.wallet.at(outTk.exchange);

        const operation = await contract.methods
          .use(1, "tezToTokenPayment", minOut, recipient)
          .send({ amount: inpAmn });

        await operation.confirmation();
      } else if (inTk.type === "token" && outTk.type === "xtz") {
        const [tokenContract, dexContract] = await Promise.all([
          tezos.wallet.at(inTk.id),
          tezos.wallet.at(inTk.exchange),
        ]);

        const batch = tezos.wallet
          .batch([])
          .withTransfer(
            tokenContract.methods
              .approve(inTk.exchange, inpAmn)
              .toTransferParams()
          )
          .withTransfer(
            dexContract.methods
              .use(2, "tokenToTezPayment", inpAmn, tzToMutez(minOut), recipient)
              .toTransferParams()
          );

        const operation = await batch.send();
        await operation.confirmation();
      } else if (inTk.type === "token" && outTk.type === "token") {
        const [
          inTokenContract,
          inDexContract,
          outDexContract,
        ] = await Promise.all([
          tezos.wallet.at(inTk.id),
          tezos.wallet.at(inTk.exchange),
          tezos.wallet.at(outTk.exchange),
        ]);

        const tezAmount = estimateTokenToTez(
          this.inputAmount,
          await getDexStorage(inTk.exchange)
        );

        const batch = tezos.wallet
          .batch([])
          .withTransfer(
            inTokenContract.methods
              .approve(inTk.exchange, inpAmn)
              .toTransferParams()
          )
          .withTransfer(
            inDexContract.methods
              .use(
                2,
                "tokenToTezPayment",
                inpAmn,
                tzToMutez(tezAmount)
                  .integerValue(BigNumber.ROUND_DOWN)
                  .toNumber(),
                recipient
              )
              .toTransferParams()
          )
          .withTransfer(
            outDexContract.methods
              .use(1, "tezToTokenPayment", minOut, recipient)
              .toTransferParams({ amount: tezAmount.toNumber() })
          );

        const operation = await batch.send();
        await operation.confirmation();
      }

      this.swapStatus = "Success!";
      this.refresh();
    } catch (err) {
      console.error(err);
      const msg = err.message;
      this.swapStatus =
        msg && msg.length < 30
          ? msg.startsWith("Dex/")
            ? msg.replace("Dex/", "")
            : msg
          : "Something went wrong";
    }
    this.swapping = false;

    await new Promise((res) => setTimeout(res, 5000));
    this.swapStatus = this.defaultSwapStatus;
  }

  refresh() {
    clearMem();
    this.loadInputBalance();
    this.calcOutputAmount();
  }
}
</script>
