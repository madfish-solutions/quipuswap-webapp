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
          @input="e => recipientAddress = e.target.value"
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
            :class="activeSlippagePercentage === percentage ? 'bg-alphawhite' : ''"
            v-on:click="activeSlippagePercentage = percentage"
          >
            {{ percentage }}
            <span class="opacity-75">%</span>
          </button>
        </div>

        <div class="flex justify-between mb-1">
          <span>Minimum received</span>
          <span>{{ minimumReceived ? `${minimumReceived} ${outputToken.name}` : "-" }}</span>
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
import BigNumber from "bignumber.js";
import mem from "mem";
import { Tezos } from "@taquito/taquito";
import { useThanosWallet } from "@/taquito/tezos";
import { ITokenItem } from "@/api/getTokens";
import { tzToMutez, mutezToTz } from "@/helpers/calc";
import NavTabs from "@/components/NavTabs.vue";
import Form, { FormIcon, FormField, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import Loader from "@/components/Loader.vue";
import { getAccount } from "@/store";
import { TEZOS_TOKEN } from "@/defaults";
import { isAddressValid } from "../taquito/tezos";

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

  inputToken: ITokenItem | null = TEZOS_TOKEN;
  inputAmount = "";
  inputBalance: string | null = null;
  inputLoading = false;

  outputToken: ITokenItem | null = null;
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
      .toFormat(6);
    return (
      price && `1 ${this.outputToken.name} = ${price} ${this.inputToken.name}`
    );
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

  async handleInputSelect(token: ITokenItem) {
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

  async handleOutputSelect(token: ITokenItem) {
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

        // const firstOp = await tokenContract.methods
        //   .approve(inTk.exchange, inpAmn)
        //   .send();
        // await firstOp.confirmation();

        // const secondOp = await dexContract.methods
        //   .use(2, "tokenToTezPayment", inpAmn, tzToMutez(minOut), recipient)
        //   .send();
        // await secondOp.confirmation();

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
        )
          .times(100 - this.activeSlippagePercentage / 2)
          .div(100)
          .integerValue(BigNumber.ROUND_DOWN);

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
                tzToMutez(tezAmount).toNumber(),
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
    } catch (err) {
      console.error(err);
      this.swapStatus =
        err.message && err.message.length < 25
          ? err.message
          : "Something went wrong";
    }
    this.swapping = false;

    await new Promise((res) => setTimeout(res, 5000));
    this.swapStatus = this.defaultSwapStatus;
  }
}

function toValidAmount(amount?: BigNumber) {
  return amount && amount.isFinite() && amount.isGreaterThan(0)
    ? amount.toString()
    : "";
}

Tezos.setProvider({ rpc: "https://testnet-tezos.giganode.io" });

async function getBalance(accountPkh: string, token: ITokenItem) {
  if (token.type === "xtz") {
    return mutezToTz(await Tezos.tz.getBalance(accountPkh));
  } else {
    const storage = await getStoragePure(token.id);
    const val = await storage.ledger.get(accountPkh);
    return new BigNumber(val ? val.balance : 0);
  }
}

const getDexStorage = (contractAddress: string) =>
  getStorage(contractAddress).then((s) => s.storage);

const getStorage = mem(getStoragePure, { maxAge: 30000 });

async function getStoragePure(contractAddress: string) {
  const contract = await getContract(contractAddress);
  return contract.storage<any>();
}

const getContract = mem(getContractPure);

function getContractPure(address: string) {
  return Tezos.contract.at(address);
}

function estimateTezToToken(tezAmount: any, dexStorage: any) {
  if (!tezAmount) return new BigNumber(0);

  const mutezAmount = tzToMutez(tezAmount);
  const fee = mutezAmount
    .div(dexStorage.feeRate)
    .integerValue(BigNumber.ROUND_DOWN);
  const newTezPool = mutezAmount.plus(dexStorage.tezPool);
  const tempTezPool = newTezPool.minus(fee);
  const newTokenPool = new BigNumber(dexStorage.invariant)
    .div(tempTezPool)
    .integerValue(BigNumber.ROUND_DOWN);
  return new BigNumber(dexStorage.tokenPool).minus(newTokenPool);
}

function estimateTezToTokenInverse(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  const newTokenPool = new BigNumber(dexStorage.tokenPool).minus(tokenAmount);
  const tempTezPool = new BigNumber(dexStorage.invariant)
    .div(newTokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const fee = tempTezPool
    .minus(dexStorage.tezPool)
    .div(new BigNumber(dexStorage.feeRate).minus(1))
    .integerValue(BigNumber.ROUND_DOWN);
  return mutezToTz(fee.times(dexStorage.feeRate));
}

function estimateTokenToTez(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  const fee = new BigNumber(tokenAmount)
    .div(dexStorage.feeRate)
    .integerValue(BigNumber.ROUND_DOWN);
  const newTokenPool = new BigNumber(dexStorage.tokenPool).plus(tokenAmount);
  const tempTokenPool = newTokenPool.minus(fee);
  const newTezPool = new BigNumber(dexStorage.invariant)
    .div(tempTokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const minTezOut = new BigNumber(dexStorage.tezPool).minus(newTezPool);
  return mutezToTz(minTezOut);
}

function estimateTokenToTezInverse(tezAmount: any, dexStorage: any) {
  if (!tezAmount) return new BigNumber(0);

  const mutezAmount = tzToMutez(tezAmount);
  const newTezPool = new BigNumber(dexStorage.tezPool).minus(mutezAmount);
  const tempTokenPool = new BigNumber(dexStorage.invariant)
    .div(newTezPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const fee = tempTokenPool
    .minus(dexStorage.tokenPool)
    .div(new BigNumber(dexStorage.feeRate).minus(1))
    .integerValue(BigNumber.ROUND_DOWN);
  return fee.times(dexStorage.feeRate);
}
</script>
