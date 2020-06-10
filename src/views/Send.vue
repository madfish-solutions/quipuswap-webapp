<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <FormField
        label="Input"
        placeholder="0.0"
        v-model="inputToken.amount"
        :subLabel="inputToken.label"
        :isLoading="inputToken.loading"
        @input="e => onInputTokenAmount(e.target.value)"
        @selectToken="onSelectInputToken"
      />
      <FormIcon>
        <img class="inline" src="@/assets/arrow-down.svg" />
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
        <img class="inline" src="@/assets/arrow-down.svg" />
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
    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal"></div>
    <div class="flex justify-center align-center text-center">
      <SubmitBtn :disabled="!send.validate" @click="handleSendMoney">
        <template v-if="!isLoading">
          {{ send.status }}
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
import Loader from "@/components/Loader.vue";
import { ITokenItem } from "@/api/getTokens";
import { getStorage, isCorrectAddress, getTokenBalance, useThanosWallet } from "@/taquito/tezos";
import sleep from "@/helpers/sleep";
import { calcTezToToken, calcTokenToTez, round } from "@/helpers/calc";

import store, { getAccount } from "@/store";

@Component({
  components: { NavTabs, Form, FormIcon, FormField, FormInfo, SubmitBtn, Loader },
})
export default class Send extends Vue {
  inputAmount: string = "0.0";
  recipient: string = "";
  isLoading: boolean = false;

  private balance: any = {
    token: 0,
    set tokenBalance(balance: number) {
      this.token = balance;
    },
  };

  private exchangeRate: any = {
    rate: "-",
    set setRate(rateString: string) {
      this.rate = rateString;
    },
  };

  private send: any = {
    validate: false,
    status: "Send",

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
    label: "",

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
    set setLabel(label: string) {
      this.label = label;
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

  async handleSendMoney() {
    const {
      inputToken: {
        amount: inputAmount,
        token: { type: inputType, exchange: inputExchange, id: inputId },
      },
      outputToken: {
        amount: outputAmount,
        token: { type: outputType, exchange: outputExchange },
      },
    } = this;
    this.isLoading = true;
    const tezos = await useThanosWallet();
    try {
      if (inputType === "xtz") {
        const contract = await tezos.wallet.at(outputExchange);
        const payment = await contract.methods
          .tezToTokenPayment(inputAmount, this.recipient)
          .send({ amount: inputAmount });
        await payment.confirmation();
      }
      if (outputType === "xtz") {
        const contractToken = await tezos.wallet.at(inputId);
        const contractDex = await tezos.wallet.at(inputExchange);
        const approve = await contractToken.methods.approve(inputExchange, inputAmount).send();
        await approve.confirmation();

        const payment = await contractDex.methods
          .tokenToTezPayment(inputAmount, outputAmount, this.recipient)
          .send({ amount: inputAmount });
        await payment.confirmation();
      }
      this.send.setSendStatus = "Done!";
    } catch {
      this.send.setSendStatus = "Something went wrong";
    }
    this.isLoading = false;
    await sleep(5000);
    this.send.setSendStatus = "Send";
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
    this.inputToken.setLabel = "";

    if (token.type === "token") {
      const account = getAccount();

      this.inputToken.setLoading = true;
      const newStorage = getStorage(token.exchange);
      const storage: any = store.state.tokensStorage[token.exchange] || (await newStorage);
      this.balance.setToken = await getTokenBalance(token.id, account.pkh);
      this.inputToken.setStorage = storage;
      store.commit("tokensStorage", { key: token.exchange, value: storage });
      const balance = await getTokenBalance(token.id, account.pkh);
      this.inputToken.setLabel = `Balance: ${balance} Token`;
      this.balance.tokenBalance = await getTokenBalance(token.id, account.pkh);
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
      this.balance.tokenBalance = await getTokenBalance(token.id, store.state.account.pkh);
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

  async validate() {
    const { inputToken, outputToken, recipient } = this;
    const isAddress = await isCorrectAddress(recipient);

    if (
      inputToken.amount &&
      outputToken.amount &&
      Object.keys(inputToken.token).length &&
      Object.keys(outputToken.token).length &&
      this.isEnoughMoney() &&
      isAddress
    ) {
      this.send.setSendPossibility = true;
      this.send.setSendStatus = "Send";
    } else {
      if (!this.isEnoughMoney()) this.send.setSendStatus = "Low balance";
      else this.send.setSendStatus = "Send";
      this.send.setSendPossibility = false;
    }
  }

  isEnoughMoney() {
    const {
      inputToken: {
        token: { type: inputType },
        amount: inputAmount,
      },
      outputToken: {
        token: { type: outputType },
      },
      balance: { token },
    } = this;
    const {
      account: { balance },
    } = store.state;
    console.log(balance, token);

    if (inputType === "xtz" && outputType === "token") {
      if (balance < parseFloat(inputAmount)) return false;
    }
    if (inputType === "token" && outputType === "xtz") {
      if (token < parseFloat(inputAmount)) return false;
    }
    return true;
  }
}
</script>
