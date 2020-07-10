<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <NavInvest />
      <FormField
        placeholder="0.0"
        label="Deposit"
        :withTezos="false"
        :onlyTezos="true"
        v-model="inputAmount"
        @input="e => onInputAmount(e.target.value)"
      />
      <FormField
        placeholder="0.0"
        label="To token"
        :withTezos="false"
        v-model="selectedToken.amount"
        :isLoading="selectedToken.loading"
        @input="e => onOutputAmount(e.target.value)"
        @selectToken="onSelectToken"
      />
      <FormIcon>
        <img src="@/assets/plus.svg" />
      </FormIcon>
      <FormField
        placeholder="tz.."
        label="Baker address"
        :withSelect="false"
        @input="e => (baker = e.target.value)"
      />
      <FormInfo>
        <div class="flex justify-between mb-1">
          <span>Exchange rate</span>
          <span>{{ stat.exchangeRate }}</span>
        </div>
        <div class="flex justify-between mb-1">
          <span>Current pool size</span>
          <span>{{ stat.poolSize }}</span>
        </div>
        <div class="flex justify-between">
          <span>Your Pool Share (%)</span>
          <span>{{ stat.poolShare }}</span>
        </div>
      </FormInfo>
    </Form>

    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal"></div>
    <div class="flex justify-center text-center">
      <SubmitBtn @click="handleAddLiquidity" :disabled="!isAddLiquid">
        <template v-if="!loading">Add Liquidity</template>
        <template v-if="loading">
          <Loader size="large" />
        </template>
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";
import NavInvest from "@/components/NavInvest.vue";
import Loader from "@/components/Loader.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import { getStorage, isCorrectAddress, useThanosWallet } from "@/taquito/tezos";
import { ITokenItem } from "@/api/getTokens";
import { calcTezToToken, calcTokenToTez, round } from "@/helpers/calc";
import store from "@/store";

@Component({
  components: {
    NavTabs,
    NavInvest,
    Form,
    FormField,
    FormIcon,
    FormInfo,
    SubmitBtn,
    Loader,
  },
})
export default class AddLiquidity extends Vue {
  inputAmount: string = "";
  baker: string = "";
  isAddLiquid: boolean = false;
  loading: boolean = false;
  private selectedToken: any = {
    token: {},
    storage: {},
    loading: false,
    amount: null,
    set setToken(token: ITokenItem) {
      this.token = token;
    },

    set setAmount(amount: any) {
      if (amount) this.amount = amount;
      else this.amount = null;
    },
    set setStorage(storage: object) {
      this.storage = storage;
    },
    set setLoading(loading: boolean) {
      this.loading = loading;
    },
  };

  stat: any = {
    exchangeRate: "-",
    poolSize: "-",
    poolShare: "-",

    set setExchangeRate(exchangeRate: string) {
      this.exchangeRate = exchangeRate;
    },

    set setPoolSize(poolSize: string) {
      this.poolSize = poolSize;
    },

    set setPoolShare(poolShare: string) {
      this.poolShare = poolShare;
    },
  };

  mounted() {
    this.$watch(
      (vm?) => [vm.inputAmount, vm.outputAmount, vm.baker],
      () => this.validate()
    );
  }

  onInputAmount(value: string) {
    this.inputAmount = value;
    if (value && Object.keys(this.selectedToken.token).length) {
      this.selectedToken.setAmount = calcTezToToken(this.selectedToken.storage, this.inputAmount);
      this.calcExchangePair();
      return;
    }
    this.inputAmount = "";
    this.selectedToken.setAmount = "";

    this.resetStats();
  }

  onOutputAmount(value: string) {
    this.selectedToken.setAmount = value;
    if (value && Object.keys(this.selectedToken.token).length) {
      this.inputAmount = calcTokenToTez(this.selectedToken.storage, this.selectedToken.amount);
      this.calcExchangePair();
      return;
    }
    this.selectedToken.setAmount = "";
    this.inputAmount = "";

    this.resetStats();
  }

  async handleAddLiquidity() {
    try {
      this.loading = true;
      const tezos = await useThanosWallet();
      const contract = await tezos.wallet.at(this.selectedToken.token.exchange);
      const investLiquidity = await contract.methods
        .investLiquidity(this.selectedToken.amount, this.baker)
        .send({ amount: this.inputAmount as any });
      await investLiquidity.confirmation();
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }

  onSelectToken = async (token: any) => {
    this.selectedToken.setToken = token;
    this.selectedToken.setLoading = true;
    const newStorage = getStorage(token.exchange);
    const storage: any = store.state.tokensStorage[token.exchange] || (await newStorage);
    this.selectedToken.setStorage = storage;
    store.commit("tokensStorage", { key: token.exchange, value: storage });
    this.selectedToken.setLoading = false;
    this.calcExchangePair();
  };

  resetStats() {
    this.stat.setPoolShare = "-";
  }

  calcExchangePair() {
    const {
      selectedToken: { storage },
    } = this;

    const amount: any = parseFloat(this.inputAmount) > 0 ? this.inputAmount : 1;
    const tokenAmount: any = `${calcTezToToken(storage, amount)}`;
    const pricePerToken = round(amount / tokenAmount);
    this.stat.setExchangeRate = `1 ${this.selectedToken.token.name} = ${pricePerToken} Tezos`;
    this.stat.setPoolSize = `${storage.tokenPool}`;
    this.stat.setPoolShare = `${((this.selectedToken.amount / storage.tokenPool) * 100).toFixed(
      2
    )} %`;
  }

  async validate() {
    const {
      inputAmount,
      selectedToken: { amount: outputAmount },
      selectedToken,
    } = this;

    if (
      inputAmount &&
      outputAmount &&
      Object.keys(selectedToken.token).length &&
      (await isCorrectAddress(this.baker))
    ) {
      this.isAddLiquid = true;
    } else {
      this.isAddLiquid = false;
    }
  }
}
</script>
