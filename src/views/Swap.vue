<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <FormField
        placeholder="0.0"
        label="Input"
        v-model="inputToken.amount"
        @input="onInputTokenAmount($event.target.value)"
        @select="onSelectInputToken"
      />
      <FormIcon>
        <img src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField
        placeholder="0.0"
        label="Output"
        v-model="outputToken.amount"
        @input="onOutputTokenAmount($event.target.value)"
        @select="onSelectOutputToken"
      />
      <FormInfo class="flex justify-between">
        <span>Exchange rate</span>
        <span>{{ exchangeRate.rate }}</span>
      </FormInfo>
    </Form>
    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      {{ swap.status }}
    </div>
    <div class="text-center">
      <SubmitBtn :disabled="!swap.isPossibleToSwap" @click="swapCoins">
        Swap
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";
import Form, { FormIcon, FormField, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import { tezToTokenSwap, tokenToTezSwap } from "@/taquito/contracts/dex";
import { approve } from "@/taquito/contracts/token";
import { ITokenItem } from "@/api/getTokens";
import { getStorage } from "@/taquito/tezos";

@Component({
  components: { NavTabs, Form, FormIcon, FormField, FormInfo, SubmitBtn },
})
export default class Swap extends Vue {
  private exchangeRate: any = {
    rate: "-",
    set setRate(rateString: string) {
      this.rate = rateString;
    },
  };

  private swap: any = {
    isPossibleToSwap: false,
    status: "Select a token to continue",
    set setSwapPossibility(isSwap: boolean) {
      this.isPossibleToSwap = isSwap;
    },
    set setSwapStatus(status: string) {
      this.status = status;
    },
  };

  private inputToken: any = {
    amount: "",
    token: {},
    storage: {},

    set setToken(token: ITokenItem) {
      this.token = token;
    },

    set setAmount(amount: any) {
      this.amount = amount;
    },
    set setStorage(storage: object) {
      this.storage = storage;
    },
  };

  private outputToken: any = {
    amount: "",
    token: {},
    storage: {},

    set setToken(token: ITokenItem) {
      this.token = token;
    },
    set setAmount(amount: any) {
      this.amount = amount;
    },
    set setStorage(storage: object) {
      this.storage = storage;
    },
  };

  swapCoins = async () => {
    const { inputToken } = this;

    if (inputToken.token.id === "xtz") {
      this.swap.setSwapStatus = "Swapping...";
      await tezToTokenSwap(
        parseInt(this.outputToken.amount, 10),
        parseInt(this.inputToken.amount, 10)
      );
      this.swap.setSwapStatus = "Done!";
    } else {
      this.swap.setSwapStatus = "Waiting for approve";

      await approve("KT1CVjrhWnYqSxHdMV6qWrfXN6mEsmtejDvX", parseInt(this.outputToken.amount, 10));
      this.swap.setSwapStatus = "Approved! Swapping...";

      await tokenToTezSwap(
        parseInt(this.outputToken.amount, 10),
        parseInt(this.inputToken.amount, 10)
      );
      this.swap.setSwapStatus = "Done!";
    }
  };

  onInputTokenAmount = async (amount: string) => {
    if (amount.length) {
      this.inputToken.setAmount = amount;
      this.calcOutputAmount(parseFloat(amount));
      this.swap.setSwapPossibility = true;
      return;
    }
    this.resetAmount();
    this.swap.setSwapPossibility = false;
  };

  onOutputTokenAmount = async (amount: string) => {
    if (amount.length) {
      this.outputToken.setAmount = amount;
      this.calcInputAmount(parseFloat(amount));
      this.swap.setSwapPossibility = true;
      return;
    }
    this.resetAmount();
    this.swap.setSwapPossibility = false;
  };

  calcOutputAmount(amount: number) {
    const { inputToken, outputToken } = this;
    if (inputToken.token.type === "xtz") {
      const tokenAmount: any = `${this.calcTezToToken(outputToken.storage, amount)}`;
      outputToken.setAmount = tokenAmount;
      const pricePerToken = (amount / tokenAmount).toFixed(2);
      this.exchangeRate.setRate = `1 ${this.outputToken.token.name} = ${pricePerToken} ${this.inputToken.token.name}`;
    }
    if (outputToken.token.type === "token" && inputToken.token.type === "token") {
      const xtzInput = `${this.calcTokenToTez(inputToken.storage, amount)}`;
      const tokenAmount: any = `${this.calcTezToToken(outputToken.storage, xtzInput)}`;
      console.log(xtzInput, tokenAmount);
      const pricePerToken = (amount / tokenAmount).toFixed(2);
      this.exchangeRate.setRate = `1 ${this.outputToken.token.name} = ${pricePerToken} ${this.inputToken.token.name}`;
      outputToken.setAmount = tokenAmount;
    }
  }

  calcInputAmount(amount: number) {
    const { inputToken, outputToken } = this;
    if (outputToken.token.type === "xtz") {
      const tokenAmount: any = `${this.calcTezToToken(inputToken.storage, amount)}`;
      const pricePerToken = (tokenAmount / outputToken.amount).toFixed(2);
      inputToken.setAmount = tokenAmount;
      this.exchangeRate.setRate = `1 Output ${this.outputToken.token.name} = ${pricePerToken} Input ${this.inputToken.token.name}`;
    }
    if (outputToken.token.type === "token" && inputToken.token.type === "token") {
      const xtzOutput = `${this.calcTokenToTez(outputToken.storage, amount)}`;
      const tokenAmount: any = `${this.calcTezToToken(inputToken.storage, xtzOutput)}`;
      console.log(xtzOutput, tokenAmount);
      const pricePerToken = (amount / tokenAmount).toFixed(2);
      this.exchangeRate.setRate = `1 Output ${this.outputToken.token.name} = ${pricePerToken} Input ${this.inputToken.token.name}`;
      inputToken.setAmount = tokenAmount;
    }
  }

  onSelectInputToken = async (token: any) => {
    this.inputToken.setToken = token;
    if (token.type === "token") {
      this.inputToken.setStorage = await getStorage(token.exchange);
    }
    this.resetAmount();
  };

  onSelectOutputToken = async (token: any) => {
    this.outputToken.setToken = token;
    if (token.type === "token") {
      this.outputToken.setStorage = await getStorage(token.exchange);
    }
    this.resetAmount();
  };

  resetAmount = () => {
    this.inputToken.setAmount = "";
    this.outputToken.setAmount = "";
  };

  calcExchangeRate() {
    const {
      inputToken: { token: input, storage: inputStorage },
      outputToken: { token: output, storage: outputStorage },
    } = this;
    if (!Object.keys(inputStorage).length || !Object.keys(outputStorage).length) return;
    if (input.type === "token" && output.type === "token") {
      const inputPricePerTezos = this.calcTezToToken(inputStorage, 1);
      const outputPricePerTezos = this.calcTezToToken(outputStorage, 1);
      console.log(inputPricePerTezos, "input", outputPricePerTezos, "out");
    }

    // if (this.inputToken.token.name && this.outputToken.token.name) {
    //   if (this.inputToken.token.id === "xtz") {
    //     this.exchangeRate.setRate = `1 ${this.inputToken.token.name} = ${(
    //       1 / this.calcTokenToTez(1)
    //     ).toFixed(2)} ${this.outputToken.token.name}`;
    //   } else {
    //     this.exchangeRate.setRate = `1 ${this.inputToken.token.name} = ${this.calcTokenToTez(1)} ${
    //       this.outputToken.token.name
    //     }`;
    //   }
    // }
  }

  calcTezToToken = (storage: any, tezAmount: any): any => {
    const mutezAmount: number = parseFloat(tezAmount) * 1000000;
    const fee: number = Number(`${mutezAmount / storage.feeRate}`);
    const newTezPool: any = Number(`${+storage.tezPool + +mutezAmount}`);
    const tempTezPool: any = Number(`${newTezPool - fee}`);
    const newTokenPool: any = Number(`${storage.invariant / tempTezPool}`);
    const minTokens = Number(`${storage.tokenPool - newTokenPool}`);
    return minTokens.toFixed(2);
  };

  calcTokenToTez = (storage: any, tokenAmount: any): any => {
    const fee: number = parseInt(`${tokenAmount / storage.feeRate}`, 10);
    const newTokenPool: any = parseInt(`${+storage.tokenPool + +tokenAmount}`, 10);
    const tempTokenPool: any = parseInt(`${newTokenPool - fee}`, 10);
    const newTesosPool: any = parseInt(`${storage.invariant / tempTokenPool}`, 10);
    const minTezos = Number(`${storage.tezPool - newTesosPool}`);
    return (minTezos / 1000000).toFixed(2);
  };
}
</script>
