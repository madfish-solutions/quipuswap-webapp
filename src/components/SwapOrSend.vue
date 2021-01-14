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
        @input="(e) => handleInputAmountChange(e.target.value)"
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
        @input="(e) => handleOutputAmountChange(e.target.value)"
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
          @input="(e) => (recipientAddress = e.target.value)"
          :spellcheck="false"
        />
      </template>

      <FormInfo class="overflow-x-auto whitespace-no-wrap">
        <div class="flex justify-between mb-1">
          <span class="mr-2">Input Dex contract</span>
          <span class="font-mono text-gray-400">{{
            inputDexAddress || "-"
          }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span class="mr-2">Output Dex contract</span>
          <span class="font-mono text-gray-400">{{
            outputDexAddress || "-"
          }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span class="mr-2">Fee</span>
          <span>{{ fee || "-" }}</span>
        </div>

        <div class="flex justify-between mb-1">
          <span class="mr-2">Exchange rate</span>
          <span>{{ exchangeRate || "-" }}</span>
        </div>

        <div class="flex mb-1">
          <span class="mr-2">Slippage tolerance</span>
          <span class="flex-1"></span>
          <button
            v-for="percentage in slippagePercentages"
            :key="percentage"
            class="px-2 py-px ml-2 text-xs rounded-md shadow-xs focus:outline-none"
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
          <span class="mr-2">Minimum received</span>
          <span>
            {{
              minimumReceived ? `${minimumReceived} ${outputToken.name}` : "-"
            }}
          </span>
        </div>
      </FormInfo>
    </Form>

    <div class="flex justify-center mt-8 text-center align-center">
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
import { OpKind } from "@taquito/taquito";
import store, { getAccount, useWallet } from "@/store";
import {
  FEE_RATE,
  XTZ_TOKEN,
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
  approveToken,
  toNat,
} from "@/core";

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

  inputToken: QSAsset | null = XTZ_TOKEN;
  inputAmount = "";
  inputBalance: string | null = null;
  inputLoading = false;

  outputToken: QSAsset | null = null;
  outputAmount = "";
  outputLoading = false;

  recipientAddress: string = "";

  slippagePercentages = [0.5, 1, 3];
  activeSlippagePercentage = 1;
  fee: string | null = null;
  inputDexAddress: string | null = null;
  outputDexAddress: string | null = null;

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
      .toFormat(this.inputToken.decimals, BigNumber.ROUND_DOWN);
    return `1 ${this.outputToken.name} = ${price} ${this.inputToken.name}`;
  }

  get minimumReceived() {
    if (!this.outputToken || !this.outputAmount) return null;
    const base = new BigNumber(100)
      .minus(this.activeSlippagePercentage)
      .div(100)
      .times(this.outputAmount);

    return base.toFixed(this.outputToken.decimals, BigNumber.ROUND_DOWN);
  }

  get canSwap() {
    const inAndOutValid =
      this.inputToken &&
      this.outputToken &&
      [this.inputAmount, this.outputAmount, this.minimumReceived].every(
        (a) => a && +a > 0
      );
    return this.send
      ? inAndOutValid && isAddressValid(this.recipientAddress)
      : inAndOutValid;
  }

  get tokens() {
    return store.state.tokens;
  }

  created() {
    this.loadInputBalance();
    this.loadFee();
  }

  @Watch("inputToken")
  onInputTokenChange() {
    this.loadInputBalance();
  }

  @Watch("account")
  onAccountChange() {
    this.loadInputBalance();
  }

  @Watch("tokens")
  onTokensChange() {
    this.loadFee();
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

  async loadFee() {
    this.fee = null;
    try {
      const token = store.state.tokens[0];
      if (token) {
        const dexStorage = await getDexStorage(token.exchange);
        const feeBn = new BigNumber(1).div(FEE_RATE).times(100);
        this.fee = `${+feeBn.toFixed(2)}%`;
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

    this.inputDexAddress = null;
    if (token.type === "token") {
      this.inputLoading = true;
      await getDexStorage(token.exchange);
      this.inputDexAddress = token.exchange;
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

    this.outputDexAddress = null;
    if (token.type === "token") {
      this.outputLoading = true;
      await getDexStorage(token.exchange);
      this.outputDexAddress = token.exchange;
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
          await getDexStorage(this.outputToken.exchange),
          this.outputToken
        );
        break;

      case inType === "token" && outType === "xtz":
        amount = estimateTokenToTez(
          this.inputAmount,
          await getDexStorage(this.inputToken.exchange),
          this.inputToken
        );
        break;

      case inType === "token" && outType === "token":
        amount = estimateTezToToken(
          await estimateTokenToTez(
            this.inputAmount,
            await getDexStorage(this.inputToken.exchange),
            this.inputToken
          ),
          await getDexStorage(this.outputToken.exchange),
          this.outputToken
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
          await getDexStorage(this.outputToken.exchange),
          this.outputToken
        );
        break;

      case inType === "token" && outType === "xtz":
        amount = estimateTokenToTezInverse(
          this.outputAmount,
          await getDexStorage(this.inputToken.exchange),
          this.inputToken
        );
        break;

      case inType === "token" && outType === "token":
        amount = estimateTokenToTezInverse(
          await estimateTezToTokenInverse(
            this.outputAmount,
            await getDexStorage(this.outputToken.exchange),
            this.outputToken
          ),
          await getDexStorage(this.inputToken.exchange),
          this.inputToken
        );
        break;
    }

    this.inputAmount = toValidAmount(amount);
  }

  async swap() {
    if (this.swapping) return;
    this.swapping = true;

    try {
      const tezos = await useWallet();
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
          .use(1, "tezToTokenPayment", toNat(minOut, outTk), recipient)
          .send({ amount: inpAmn });

        await operation.confirmation();
      } else if (inTk.type === "token" && outTk.type === "xtz") {
        const [tokenContract, dexContract] = await Promise.all([
          tezos.wallet.at(inTk.id),
          tezos.wallet.at(inTk.exchange),
        ]);

        const tokenAmountNat = toNat(inpAmn, inTk).toNumber();

        let withAllowanceReset = false;
        try {
          await tezos.estimate.batch([
            {
              kind: OpKind.TRANSACTION,
              ...approveToken(
                inTk,
                tokenContract,
                me,
                inTk.exchange,
                tokenAmountNat
              ).toTransferParams(),
            },
            {
              kind: OpKind.TRANSACTION,
              ...dexContract.methods
                .use(
                  2,
                  "tokenToTezPayment",
                  tokenAmountNat,
                  tzToMutez(minOut),
                  recipient
                )
                .toTransferParams(),
            },
          ]);
        } catch (err) {
          if (err?.message === "UnsafeAllowanceChange") {
            withAllowanceReset = true;
          } else {
            console.error(err);
          }
        }

        let batch = tezos.wallet.batch([]);

        if (withAllowanceReset) {
          batch = batch.withTransfer(
            approveToken(
              inTk,
              tokenContract,
              me,
              inTk.exchange,
              0
            ).toTransferParams()
          );
        }

        batch = batch
          .withTransfer(
            approveToken(
              inTk,
              tokenContract,
              me,
              inTk.exchange,
              tokenAmountNat
            ).toTransferParams()
          )
          .withTransfer(
            dexContract.methods
              .use(
                2,
                "tokenToTezPayment",
                tokenAmountNat,
                tzToMutez(minOut),
                recipient
              )
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
          await getDexStorage(inTk.exchange),
          inTk
        );

        const inpAmnNat = toNat(inpAmn, inTk).toNumber();

        let withAllowanceReset = false;
        try {
          await tezos.estimate.batch([
            {
              kind: OpKind.TRANSACTION,
              ...approveToken(
                inTk,
                inTokenContract,
                me,
                inTk.exchange,
                inpAmnNat
              ).toTransferParams(),
            },
            {
              kind: OpKind.TRANSACTION,
              ...inDexContract.methods
                .use(
                  2,
                  "tokenToTezPayment",
                  inpAmnNat,
                  tzToMutez(tezAmount)
                    .integerValue(BigNumber.ROUND_DOWN)
                    .toNumber(),
                  recipient
                )
                .toTransferParams(),
            },
            {
              kind: OpKind.TRANSACTION,
              ...outDexContract.methods
                .use(1, "tezToTokenPayment", toNat(minOut, outTk), recipient)
                .toTransferParams({ amount: tezAmount.toNumber() }),
            },
          ]);
        } catch (err) {
          if (err?.message === "UnsafeAllowanceChange") {
            withAllowanceReset = true;
          } else {
            console.error(err);
          }
        }

        let batch = tezos.wallet.batch([]);

        if (withAllowanceReset) {
          batch = batch.withTransfer(
            approveToken(
              inTk,
              inTokenContract,
              me,
              inTk.exchange,
              0
            ).toTransferParams()
          );
        }

        batch = batch
          .withTransfer(
            approveToken(
              inTk,
              inTokenContract,
              me,
              inTk.exchange,
              inpAmnNat
            ).toTransferParams()
          )
          .withTransfer(
            inDexContract.methods
              .use(
                2,
                "tokenToTezPayment",
                inpAmnNat,
                tzToMutez(tezAmount)
                  .integerValue(BigNumber.ROUND_DOWN)
                  .toNumber(),
                recipient
              )
              .toTransferParams()
          )
          .withTransfer(
            outDexContract.methods
              .use(1, "tezToTokenPayment", toNat(minOut, outTk), recipient)
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
