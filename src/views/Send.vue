<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <FormField
        label="Input"
        placeholder="0.0"
        v-model="inputToken.amount"
        :isLoading="inputToken.loading"
        @input="e => onInputTokenAmount(e.target.value)"
        @selectToken="onSelectInputToken"
      />
      <FormIcon>
        <img class="inline" src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField
        label="Output"
        placeholder="0.0"
        v-model="outputToken.amount"
        :isLoading="outputToken.loading"
        @input="e => onOutputTokenAmount(e.target.value)"
        @selectToken="onSelectOutputToken"
      />
      <FormIcon>
        <img class="inline" src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField
        label="Recipient Address"
        placeholder="0x1234..."
        :withSelect="false"
        v-model="recipient"
        @input="e => onInputRecipient(e.target.value)"
      />
      <FormInfo class="flex justify-between">
        <span>Exchange rate</span>
        <span>{{ exchangeRate.rate }}</span>
      </FormInfo>
    </Form>

    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      Select a token to continue
    </div>
    <div class="text-center">
      <SubmitBtn :disabled="!send.validate">
        Send
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";

import Form, { FormIcon, FormField, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import { ITokenItem } from "@/api/getTokens";
import { getStorage } from "@/taquito/tezos";
import { calcTezToToken, calcTokenToTez, round } from "@/helpers/calc";
import store from "@/store";

@Component({
  components: { NavTabs, Form, FormIcon, FormField, FormInfo, SubmitBtn },
})
export default class Send extends Vue {
  inputAmount: string = "0.0";
  recipient: string = "";
  private exchangeRate: any = {
    rate: "-",
    set setRate(rateString: string) {
      this.rate = rateString;
    },
  };

  private send: any = {
    validate: false,
    status: "Select a token to continue",

    set setSendPossibility(isSwap: boolean) {
      this.validate = isSwap;
    },
    set setSendStatus(status: string) {
      this.status = status;
    },
  };

  private inputToken: any = {
    amount: "",
    token: {},
    storage: {},
    loading: false,

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
    storage: {},
    loading: false,

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
        vm.recipient,
      ],
      () => this.validate()
    );
  }

  onInputRecipient(address: string) {
    this.recipient = address;
  }

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
    const { inputToken, outputToken, recipient } = this;
    if (
      inputToken.amount &&
      outputToken.amount &&
      Object.keys(inputToken.token).length &&
      Object.keys(outputToken.token).length &&
      recipient.length
    ) {
      this.send.setSendPossibility = true;
    } else {
      this.send.setSendPossibility = false;
    }
  }
}
</script>
