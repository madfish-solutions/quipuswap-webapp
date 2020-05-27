<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form :style="swap.isLoading && 'pointer-events:none'">
      <FormField
        placeholder="0.0"
        label="Input"
        v-model="inputToken.amount"
        @input="e => onInputTokenAmount(e.target.value)"
        @selectToken="onSelectInputToken"
      />
      <FormIcon>
        <img src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField
        placeholder="0.0"
        label="Output"
        v-model="outputToken.amount"
        @input="e => onOutputTokenAmount(e.target.value)"
        @selectToken="onSelectOutputToken"
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
import { calcTezToToken, calcTokenToTez } from "@/helpers/convert";

@Component({
  components: { NavTabs, Form, FormIcon, FormField, FormInfo, SubmitBtn },
})
export default class Swap extends Vue {
  inputAmount: string = "0.0";
  private exchangeRate: any = {
    rate: "-",
    set setRate(rateString: string) {
      this.rate = rateString;
    },
  };

  private swap: any = {
    isPossibleToSwap: false,
    isLoading: false,
    status: "Select a token to continue",
    set setSwapPossibility(isSwap: boolean) {
      this.isPossibleToSwap = isSwap;
    },
    set setSwapStatus(status: string) {
      this.status = status;
    },
    set setIsLoading(loading: boolean) {
      this.isLoading = loading;
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
      if (amount.length) this.amount = amount;
      else this.amount = null;
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
      if (amount.length) this.amount = amount;
      else this.amount = null;
    },
    set setStorage(storage: object) {
      this.storage = storage;
    },
  };

  swapCoins = async () => {
    const {
      inputToken: {
        amount: inputAmount,
        token: { type: inputType },
      },
      outputToken: {
        amount: outputAmount,
        token: { type: outputType, id: outputId },
      },
    } = this;

    if (inputType === "xtz") {
      this.swap.setSwapStatus = "Swapping...";
      await tezToTokenSwap(
        this.outputToken.token.exchange,
        parseInt(outputAmount, 10),
        parseInt(inputAmount, 10)
      );
      this.swap.setSwapStatus = "Done!";
    }

    if (outputType === "xtz") {
      this.swap.setSwapStatus = "Waiting for approve";

      await approve(outputId, this.inputToken.token.exchange, parseInt(outputAmount, 10));
      this.swap.setSwapStatus = "Approved! Swapping...";

      await tokenToTezSwap(
        this.inputToken.token.exchange,
        parseInt(outputAmount, 10),
        parseInt(inputAmount, 10)
      );
      this.swap.setSwapStatus = "Done!";
    }
  };

  onInputTokenAmount = async (amount: string) => {
    this.inputToken.setAmount = amount;
    if (amount.length) {
      this.calcOutputAmount(parseFloat(amount));
      this.swap.setSwapPossibility = true;
      return;
    }
    this.outputToken.setAmount = "";
    this.swap.setSwapPossibility = false;
  };

  onOutputTokenAmount = async (amount: string) => {
    this.outputToken.setAmount = amount;
    if (amount.length) {
      this.calcInputAmount(parseFloat(amount));
      this.swap.setSwapPossibility = true;
      return;
    }
    this.inputToken.setAmount = "";
    this.swap.setSwapPossibility = false;
  };

  calcOutputAmount(amount: number) {
    const {
      inputToken: {
        token: { type: inputType },
        storage: inputStorage,
      },
      outputToken: {
        token: { type: outputType },
        storage: outputStorage,
      },
    } = this;
    if (inputType === "xtz" && outputType === "token") {
      const tokenAmount: any = `${calcTezToToken(outputStorage, amount)}`;
      const pricePerToken = (amount / tokenAmount).toPrecision();
      this.outputToken.setAmount = tokenAmount;
      this.exchangeRate.setRate = `1 ${this.outputToken.token.name} = ${pricePerToken} ${this.inputToken.token.name}`;
    }
    if (inputType === "token" && outputType === "xtz") {
      const xtzInput: any = `${calcTokenToTez(inputStorage, amount)}`;
      const pricePerToken = (amount / xtzInput).toPrecision();
      this.outputToken.setAmount = parseFloat(xtzInput).toPrecision();
      this.exchangeRate.setRate = `1 ${this.outputToken.token.name} = ${pricePerToken} ${this.inputToken.token.name}`;
    }
  }

  calcInputAmount(amount: number) {
    const {
      inputToken: {
        token: { type: inputType },
        storage: inputStorage,
      },
      outputToken: {
        token: { type: outputType },
        storage: outputStorage,
      },
    } = this;
    if (inputType === "xtz" && outputType === "token") {
      const tokenAmount: any = `${calcTokenToTez(outputStorage, amount)}`;
      const pricePerToken = (tokenAmount / amount).toPrecision(5);
      this.inputToken.setAmount = parseFloat(tokenAmount).toFixed(8);
      this.exchangeRate.setRate = `1 ${this.outputToken.token.name} = ${pricePerToken} Input ${this.inputToken.token.name}`;
    }
    if (inputType === "token" && outputType === "xtz") {
      const xtzOutput = `${calcTezToToken(inputStorage, amount)}`;
      const tokenAmount: any = `${calcTezToToken(outputStorage, xtzOutput)}`;
      const pricePerToken = (amount / tokenAmount).toPrecision(5);
      this.exchangeRate.setRate = `1 ${this.outputToken.token.name} = ${pricePerToken} Input ${this.inputToken.token.name}`;
      this.inputToken.setAmount = xtzOutput;
    }
  }

  onSelectInputToken = async (token: any) => {
    this.inputToken.setToken = token;
    if (token.type === "token") {
      this.swap.setIsLoading = true;
      this.inputToken.setStorage = await getStorage(token.exchange);
      this.swap.setIsLoading = false;
    }
    this.calcExchangePair();
  };

  onSelectOutputToken = async (token: any) => {
    this.outputToken.setToken = token;
    if (token.type === "token") {
      this.swap.setIsLoading = true;
      this.outputToken.setStorage = await getStorage(token.exchange);
      this.swap.setIsLoading = false;
    }
    this.calcExchangePair();
  };

  calcExchangePair() {
    const notAcceptablePair = [this.inputToken.type, this.outputToken.type].every(
      val => val === "xtz"
    );
    if (notAcceptablePair) return 0;
    if (this.inputToken.amount) {
      return this.calcOutputAmount(this.inputToken.amount);
    }
    if (this.outputToken.amount) {
      return this.calcInputAmount(this.inputToken.amount);
    }
    return 0;
  }
}
</script>
