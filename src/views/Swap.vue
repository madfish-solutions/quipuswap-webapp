<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form :style="swap.isLoading && 'pointer-events:none'">
      <FormField
        placeholder="0.0"
        label="Input"
        v-model="inputToken.amount"
        :isLoading="inputToken.loading"
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
        :isLoading="outputToken.loading"
        @input="e => onOutputTokenAmount(e.target.value)"
        @selectToken="onSelectOutputToken"
      />
      <FormInfo class="flex justify-between">
        <span>Exchange rate</span>
        <span>{{ exchangeRate.rate }}</span>
      </FormInfo>
    </Form>
    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      <!-- {{ swap.status }} -->
    </div>
    <div class="flex justify-center align-center text-center">
      <SubmitBtn :disabled="!swap.isPossibleToSwap" @click="swapCoins">
        <template v-if="!isLoading">
          {{ swap.status }}
        </template>
        <template v-if="isLoading">
          <Loader size="large" />
        </template>
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
import { calcTezToToken, calcTokenToTez, round } from "@/helpers/calc";
import store from "@/store";

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
    status: "Swap",
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
    loading: false,
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
    set setLoading(loading: boolean) {
      this.loading = loading;
    },
  };

  private outputToken: any = {
    amount: "",
    token: {},
    loading: false,
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
    set setLoading(loading: boolean) {
      this.loading = loading;
    },
  };

  mounted() {
    this.$watch(
      (vm?) => [
        vm.inputToken.amount,
        vm.inputToken.token,
        vm.outputToken.amount,
        vm.outputToken.token,
      ],
      () => this.validate()
    );
  }

  swapCoins = async () => {
    const {
      inputToken: {
        amount: inputAmount,
        token: { type: inputType, id: inputId },
      },
      outputToken: {
        amount: outputAmount,
        token: { type: outputType },
      },
    } = this;
    try {
      if (inputType === "xtz") {
        this.swap.setSwapStatus = "Swapping...";
        await tezToTokenSwap(this.outputToken.token.exchange, outputAmount, inputAmount);
        this.swap.setSwapStatus = "Done!";
      }

      if (outputType === "xtz") {
        this.swap.setSwapStatus = "Waiting for approve";
        await approve(inputId, this.inputToken.token.exchange, inputAmount);
        this.swap.setSwapStatus = "Approved! Swapping...";
        await tokenToTezSwap(this.inputToken.token.exchange, inputAmount, outputAmount);
        this.swap.setSwapStatus = "Done!";
      }
    } catch {
      this.swap.setSwapStatus = "Error!";
    }
    setTimeout(() => {
      this.swap.setSwapStatus = "Swap";
    }, 5000);
  };

  onInputTokenAmount = async (amount: string) => {
    this.inputToken.setAmount = amount;
    if (amount.length) {
      this.calcOutputAmount(parseFloat(amount));
      return;
    }
    this.outputToken.setAmount = "";
  };

  onOutputTokenAmount = async (amount: string) => {
    this.outputToken.setAmount = amount;
    if (amount.length) {
      this.calcInputAmount(parseFloat(amount));
      return;
    }
    this.inputToken.setAmount = "";
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
      this.outputToken.setAmount = amount && tokenAmount;
      this.calcExchangePair();
    }
    if (inputType === "token" && outputType === "xtz") {
      const xtzInput: any = `${calcTokenToTez(inputStorage, amount)}`;
      this.outputToken.setAmount = amount && xtzInput;
      this.calcExchangePair();
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
    if (inputType === "xtz" && outputType === "token" && amount) {
      const tokenAmount: any = `${calcTokenToTez(outputStorage, amount)}`;
      this.inputToken.setAmount = tokenAmount;
      this.calcExchangePair();
    }
    if (inputType === "token" && outputType === "xtz" && amount) {
      const xtzOutput: any = `${calcTezToToken(inputStorage, amount)}`;
      this.inputToken.setAmount = xtzOutput;
      this.calcExchangePair();
    }
  }

  onSelectInputToken = async (token: any) => {
    this.inputToken.setToken = token;
    this.exchangeRate.setRate = "-";

    if (token.type === "token") {
      this.inputToken.setLoading = true;
      const newStorage = getStorage(token.exchange);
      const storage: any = store.state.tokensStorage[token.exchange] || (await newStorage);
      this.inputToken.setStorage = storage;
      store.commit("tokensStorage", { key: token.exchange, value: storage });
      this.inputToken.setLoading = false;
    }
    this.calcOutputAmount(this.inputToken.amount);
  };

  onSelectOutputToken = async (token: any) => {
    this.outputToken.setToken = token;
    this.exchangeRate.setRate = "-";

    if (token.type === "token") {
      this.outputToken.setLoading = true;
      const newStorage = getStorage(token.exchange);
      const storage: any = store.state.tokensStorage[token.exchange] || (await newStorage);
      this.outputToken.setStorage = storage;
      store.commit("tokensStorage", { key: token.exchange, value: storage });
      this.outputToken.setLoading = false;
    }
    this.calcOutputAmount(this.inputToken.amount);
  };

  calcExchangePair() {
    const {
      inputToken: {
        token: { type: inputType },
        storage: inputStorage,
        amount: inputAmount,
      },
      outputToken: {
        token: { type: outputType },
        storage: outputStorage,
      },
    } = this;

    if (inputType === "xtz" && outputType === "token") {
      const amount = inputAmount > 0 ? inputAmount : 1;
      const tokenAmount: any = `${calcTezToToken(outputStorage, amount)}`;
      const pricePerToken = round(amount / tokenAmount);
      this.exchangeRate.setRate = `1 ${this.outputToken.token.name} = ${pricePerToken} ${this.inputToken.token.name}`;
    }
    if (inputType === "token" && outputType === "xtz") {
      const amount = inputAmount > 0 ? inputAmount : 1;
      const xtzInput: any = `${calcTokenToTez(inputStorage, amount)}`;
      const pricePerToken = round(amount / xtzInput);
      this.exchangeRate.setRate = `1 ${this.outputToken.token.name} = ${pricePerToken} ${this.inputToken.token.name}`;
    }
  }

  validate() {
    const { inputToken, outputToken } = this;
    if (
      inputToken.amount &&
      outputToken.amount &&
      Object.keys(inputToken.token).length &&
      Object.keys(outputToken.token).length
    ) {
      this.swap.setSwapPossibility = true;
    } else {
      this.swap.setSwapPossibility = false;
    }
  }
}
</script>
