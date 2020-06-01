<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <NavInvest />
      <FormField
        label="Pool tokens"
        placeholder="0.0"
        :withTezos="false"
        v-model="selectedToken.amount"
        @input="e => onInputAmount(e.target.value)"
        @selectToken="onSelectToken"
      />
      <FormIcon>
        <img src="@/assets/arrow-down.png" />
      </FormIcon>
      <FormField
        label="Output"
        :onlyTezos="true"
        placeholder="0.0"
        v-model="outputAmount"
        @input="e => onOutputAmount(e.target.value)"
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
      <SubmitBtn :disabled="!isRemoveLiquid">
        Remove Liquidity
      </SubmitBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";
import NavInvest from "@/components/NavInvest.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import { divestLiquidity } from "@/taquito/contracts/dex";
import { getStorage } from "@/taquito/tezos";
import { ITokenItem } from "@/api/getTokens";
import { calcTezToToken, calcTokenToTez, round } from "@/helpers/calc";
import store from "@/store";

@Component({
  components: { NavTabs, NavInvest, Form, FormField, FormIcon, FormInfo, SubmitBtn },
})
export default class RemoveLiquidity extends Vue {
  isRemoveLiquid: boolean = false;
  outputAmount: string = "";
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
      (vm?) => [vm.outputAmount],
      () => this.validate()
    );
  }

  onInputAmount(value: string) {
    this.selectedToken.setAmount = value;
    if (value && Object.keys(this.selectedToken.token).length) {
      this.outputAmount = calcTokenToTez(this.selectedToken.storage, this.selectedToken.amount);
      this.calcExchangePair();
      return;
    }
    this.outputAmount = "";
    this.selectedToken.setAmount = "";

    this.resetStats();
  }

  onOutputAmount(value: string) {
    this.outputAmount = value;
    if (value && Object.keys(this.selectedToken.token).length) {
      this.selectedToken.setAmount = calcTezToToken(this.selectedToken.storage, this.outputAmount);
      this.calcExchangePair();
      return;
    }
    this.selectedToken.setAmount = "";
    this.outputAmount = "";

    this.resetStats();
  }

  handleAddLiquidity() {
    divestLiquidity(
      this.selectedToken.token.exchange,
      1,
      this.outputAmount,
      this.selectedToken.amount
    );
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

    const amount: any = parseFloat(this.selectedToken.amount) > 0 ? this.selectedToken.amount : 1;
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
      outputAmount,
      selectedToken: { amount: inputAmount },
      selectedToken,
    } = this;

    if (inputAmount && outputAmount && Object.keys(selectedToken.token).length) {
      this.isRemoveLiquid = true;
    } else {
      this.isRemoveLiquid = false;
    }
  }
}
</script>
