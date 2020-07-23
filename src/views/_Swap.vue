<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form :style="swap.isLoading && 'pointer-events:none'">
      <FormField
        placeholder="0.0"
        label="Input"
        v-model="inputToken.amount"
        :subLabel="inputToken.label"
        :isLoading="inputToken.loading"
        @input="e => onInputTokenAmount(e.target.value)"
        @selectToken="onSelectInputToken"
      />

      <FormIcon>
        <img src="@/assets/arrow-down.svg" />
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
        <template v-if="!swap.loading">{{ swap.status }}</template>
        <template v-if="swap.loading">
          <Loader size="large" />
        </template>
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import BigNumber from "bignumber.js";
import NavTabs from "@/components/NavTabs.vue";
import Form, { FormIcon, FormField, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import Loader from "@/components/Loader.vue";
import { ITokenItem } from "@/api/getTokens";
import { getStorage, getTokenBalance, useThanosWallet } from "@/taquito/tezos";
import {
  calcTezToToken,
  calcTokenToTez,
  round,
  tzToMutez,
  mutezToTz,
} from "@/helpers/calc";
import sleep from "@/helpers/sleep";
import store, { getAccount } from "@/store";
import bus from "@/store/bus";

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
export default class Swap extends Vue {
  private balance: any = {
    token: 0,
    set tokenBalance(balance: number) {
      this.token = balance;
    },
  };

  inputAmount: string = "0.0";

  private exchangeRate: any = {
    rate: "-",
    set setRate(rateString: string) {
      this.rate = rateString;
    },
  };

  private swap: any = {
    isPossibleToSwap: false,
    loading: false,
    status: "Swap",
    set setSwapPossibility(isSwap: boolean) {
      this.isPossibleToSwap = isSwap;
    },
    set setSwapStatus(status: string) {
      this.status = status;
    },
    set setLoading(loading: boolean) {
      this.loading = loading;
    },
  };

  private inputToken: any = {
    amount: "",
    loading: false,
    token: {},
    storage: {},
    label: "",
    set setToken(token: ITokenItem) {
      this.token = token;
    },

    set setAmount(amount: any) {
      if (typeof amount === "string") this.amount = amount;
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
    loading: false,
    storage: {},
    set setToken(token: ITokenItem) {
      this.token = token;
    },
    set setAmount(amount: any) {
      if (typeof amount === "string") this.amount = amount;
      else this.amount = null;
    },
    set setStorage(storage: object) {
      this.storage = storage;
    },
    set setLoading(loading: boolean) {
      this.loading = loading;
    },
  };

  async mounted() {
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
    this.swap.setLoading = true;

    const tezos = await useThanosWallet();
    try {
      const me = await tezos.wallet.pkh();

      if (inputType === "xtz") {
        const contract = await tezos.wallet.at(this.outputToken.token.exchange);
        const operation = await contract.methods
          .use(1, "tezToTokenPayment", outputAmount, me)
          .send({ amount: inputAmount });
        await operation.confirmation();
      }
      if (outputType === "xtz") {
        const contractToken = await tezos.wallet.at(inputId);
        const contractDex = await tezos.wallet.at(
          this.inputToken.token.exchange
        );
        const approve = await contractToken.methods
          .approve(this.inputToken.token.exchange, inputAmount)
          .send();
        await approve.confirmation();

        const swap = await contractDex.methods
          .use(2, "tokenToTezPayment", inputAmount, outputAmount, me)
          .send();
        await swap.confirmation();
      }
      this.swap.setSwapStatus = "Swap is done successful";
      bus.$emit("refreshWallet");
    } catch (e) {
      console.error(e);
      this.swap.setSwapStatus = "Something went wrong";
    }
    this.swap.setLoading = false;
    await sleep(5000);
    this.swap.setSwapStatus = "Swap";
  };

  onInputTokenAmount = (amount: string) => {
    const isNum = /^[0-9.]*$/g.test(amount);
    this.inputToken.setAmount = amount;
    if (isNum) {
      this.calcOutputAmount(amount);
      return;
    }
    this.outputToken.setAmount = "";
  };

  onOutputTokenAmount = (amount: string) => {
    const isNum = /^[0-9]*$/g.test(amount);
    if (isNum) {
      this.outputToken.setAmount = amount;
      this.calcInputAmount(amount);
      return;
    }
    this.outputToken.setAmount = this.outputToken.amount;
    this.inputToken.setAmount = "";
  };

  calcOutputAmount(amount: any) {
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
      const tokenAmount: any = getTezToToken(outputStorage, amount); // `${calcTezToToken(outputStorage, amount)}`;
      this.outputToken.setAmount = amount && tokenAmount;
      this.calcExchangePair();
    }
    if (inputType === "token" && outputType === "xtz") {
      const xtzInput: any = getTokenToTez(inputStorage, amount); // `${calcTokenToTez(inputStorage, amount)}`;
      this.outputToken.setAmount = amount && xtzInput;
      this.calcExchangePair();
    }
  }

  calcInputAmount(amount: any) {
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
    console.info(inputType, outputType);
    if (inputType === "xtz" && outputType === "token" && amount) {
      const tokenAmount: any = getTokenToTez(outputStorage, amount); // `${calcTokenToTez(outputStorage, amount)}`;
      this.inputToken.setAmount = tokenAmount;
      this.calcExchangePair();
    }
    if (inputType === "token" && outputType === "xtz" && amount) {
      const xtzOutput: any = getTezToTokenInverse(inputStorage, amount); // `${calcTezToToken(inputStorage, amount)}`;
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
      const storage: any =
        store.state.tokensStorage[token.exchange] || (await newStorage);
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
      const account = getAccount();
      this.outputToken.setLoading = true;
      const newStorage = getStorage(token.exchange);
      const storage: any =
        store.state.tokensStorage[token.exchange] || (await newStorage);
      this.outputToken.setStorage = storage;
      store.commit("tokensStorage", { key: token.exchange, value: storage });
      this.outputToken.setLoading = false;
      const balance = await getTokenBalance(token.id, account.pkh);
      this.balance.tokenBalance = balance;
    }
    this.calcOutputAmount(this.inputToken.amount);
  };

  async calcExchangePair() {
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
    if (!this.isEnoughMoney()) this.swap.setSwapStatus = "Low balance";
  }

  validate() {
    const { inputToken, outputToken } = this;
    if (
      inputToken.amount &&
      outputToken.amount &&
      Object.keys(inputToken.token).length &&
      Object.keys(outputToken.token).length &&
      this.isEnoughMoney()
    ) {
      this.swap.setSwapPossibility = true;
      this.swap.setSwapStatus = "Swap";
    } else {
      this.swap.setSwapPossibility = false;
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
    const { balance } = getAccount();
    if (inputType === "xtz" && outputType === "token") {
      if (balance < parseFloat(inputAmount)) return false;
    }
    if (inputType === "token" && outputType === "xtz") {
      if (token < parseFloat(inputAmount)) return false;
    }
    return true;
  }
}

function getTezToToken(storage: any, tezAmount: any) {
  if (!tezAmount) return 0;
  const mutezAmount = tzToMutez(tezAmount);
  const fee = mutezAmount
    .div(storage.feeRate)
    .integerValue(BigNumber.ROUND_DOWN);

  const newTezPool = mutezAmount.plus(storage.tezPool);
  const tempTezPool = newTezPool.minus(fee);
  const newTokenPool = new BigNumber(storage.invariant)
    .div(tempTezPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const tokenAmount = new BigNumber(storage.tokenPool).minus(newTokenPool);
  // console.info(
  //   JSON.parse(
  //     JSON.stringify({
  //       storage,
  //       mutezAmount,
  //       fee,
  //       newTezPool,
  //       tempTezPool,
  //       newTokenPool,
  //       minTokens,
  //       tokenAmount,
  //     })
  //   )
  // );
  return tokenAmount.toString();
}

function getTezToTokenInverse(storage: any, tokenAmount: any) {
  if (!tokenAmount) return 0;

  const newTokenPool = new BigNumber(storage.tokenPool).minus(tokenAmount);
  const tempTezPool = new BigNumber(storage.invariant)
    .div(newTokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const fee = tempTezPool
    .minus(storage.tezPool)
    .div(new BigNumber(storage.feeRate).minus(1))
    .integerValue(BigNumber.ROUND_DOWN);
  const tezAmount = mutezToTz(fee.times(storage.feeRate));

  // console.info(
  //   JSON.parse(
  //     JSON.stringify({
  //       storage,
  //       mutezAmount,
  //       fee,
  //       newTezPool,
  //       tempTezPool,
  //       newTokenPool,
  //       minTokens,
  //       tokenAmount,
  //     })
  //   )
  // );
  return tezAmount.toString();
}

function getTokenToTez(storage: any, tokenAmount: any) {
  if (!tokenAmount) return 0;
  const fee = new BigNumber(tokenAmount)
    .div(storage.feeRate)
    .integerValue(BigNumber.ROUND_DOWN);
  const newTokenPool = new BigNumber(storage.tokenPool).plus(tokenAmount);
  const tempTokenPool = newTokenPool.minus(fee);
  const newTezPool = new BigNumber(storage.invariant)
    .div(tempTokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const minTezOut = new BigNumber(storage.tezPool).minus(newTezPool);
  const tezAmount = mutezToTz(minTezOut).toString();
  console.info(
    JSON.parse(
      JSON.stringify({
        tokenAmount,
        storage,
        fee,
        newTokenPool,
        tempTokenPool,
        newTezPool,
        minTezOut,
        tezAmount,
      })
    )
  );
  return tezAmount;
}
</script>
