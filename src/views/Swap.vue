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
import { getDexStorage, tezToTokenSwap, tokenToTezSwap } from "@/taquito/contracts/dex";
import { approve } from "@/taquito/contracts/token";
import { ITokenItem } from "@/api/getTokens";

getDexStorage().then(a => console.log(a));
@Component({
  components: { NavTabs, Form, FormIcon, FormField, FormInfo, SubmitBtn },
})
export default class Swap extends Vue {
  private dexStorage: any = {
    storage: {},
    set setStorage(storage: any) {
      this.storage = storage;
    },
  };

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
    set setToken(token: ITokenItem) {
      this.token = token;
    },
    set setAmount(amount: any) {
      this.amount = amount;
    },
  };

  private outputToken: any = {
    amount: "",
    token: {},
    set setToken(token: ITokenItem) {
      this.token = token;
    },
    set setAmount(amount: any) {
      this.amount = amount;
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

  onInputTokenAmount = async (val: string) => {
    if (val.length) {
      this.inputToken.setAmount = val;
      this.calcOutputAmount();
      this.swap.setSwapPossibility = true;

      return;
    }
    this.resetAmount();
    this.swap.setSwapPossibility = false;
  };

  onOutputTokenAmount = async (val: string) => {
    if (val.length) {
      this.outputToken.setAmount = val;
      this.calcInputAmount();
      this.swap.setSwapPossibility = true;

      return;
    }
    this.resetAmount();
    this.swap.setSwapPossibility = false;
  };

  calcOutputAmount() {
    const { inputToken, outputToken } = this;
    if (inputToken.amount) {
      if (inputToken.token.id === "xtz") {
        outputToken.setAmount = `${this.calcTezToToken(inputToken.amount)}`;
      } else {
        outputToken.setAmount = `${this.calcTokenToTez(inputToken.amount)}`;
      }
    }
  }

  calcInputAmount() {
    const { inputToken, outputToken } = this;
    if (outputToken.amount) {
      if (outputToken.token.id === "xtz") {
        inputToken.setAmount = `${this.calcTezToToken(outputToken.amount)}`;
      } else {
        inputToken.setAmount = `${this.calcTokenToTez(outputToken.amount)}`;
      }
    }
  }

  async mounted() {
    this.dexStorage.setStorage = await getDexStorage();
  }

  onSelectInputToken = (val: any) => {
    this.inputToken.setToken = val;
    this.calcExchangeRate();
    this.resetAmount();
  };

  onSelectOutputToken = (val: any) => {
    this.outputToken.setToken = val;
    this.calcExchangeRate();
    this.resetAmount();
  };

  resetAmount = () => {
    this.inputToken.setAmount = "";
    this.outputToken.setAmount = "";
  };

  calcExchangeRate() {
    if (this.inputToken.token.name && this.outputToken.token.name) {
      if (this.inputToken.token.id === "xtz") {
        this.exchangeRate.setRate = `1 ${this.inputToken.token.name} = ${(
          1 / this.calcTokenToTez(1)
        ).toFixed(2)} ${this.outputToken.token.name}`;
      } else {
        this.exchangeRate.setRate = `1 ${this.inputToken.token.name} = ${this.calcTokenToTez(1)} ${
          this.outputToken.token.name
        }`;
      }
    }
  }

  calcTezToToken = (tezAmount: any): any => {
    const { storage } = this.dexStorage;
    const mutezAmount: number = parseFloat(tezAmount) * 1000000;
    const fee: number = Number(`${mutezAmount / storage.feeRate}`);
    const newTezPool: any = Number(`${+storage.tezPool + +mutezAmount}`);
    const tempTezPool: any = Number(`${newTezPool - fee}`);
    const newTokenPool: any = Number(`${storage.invariant / tempTezPool}`);
    const minTokens = Number(`${storage.tokenPool - newTokenPool}`);
    return minTokens.toFixed(2);
  };

  calcTokenToTez = (tokenAmount: any): any => {
    const { storage } = this.dexStorage;
    const fee: number = parseInt(`${tokenAmount / storage.feeRate}`, 10);
    const newTokenPool: any = parseInt(`${+storage.tokenPool + +tokenAmount}`, 10);
    const tempTokenPool: any = parseInt(`${newTokenPool - fee}`, 10);
    const newTesosPool: any = parseInt(`${storage.invariant / tempTokenPool}`, 10);
    const minTezos = Number(`${storage.tezPool - newTesosPool}`);
    return (minTezos / 1000000).toFixed(2);
  };
}
</script>
