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
        v-model="outputAmount"
        @input="e => onOutputAmount(e.target.value)"
        @selectToken="onSelectToken"
      />
      <FormIcon>
        <img src="@/assets/plus.png" />
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
          <span>-</span>
        </div>
        <div class="flex justify-between mb-1">
          <span>Current pool size</span>
          <span>-</span>
        </div>
        <div class="flex justify-between">
          <span>Your Pool Share (%)</span>
          <span>-</span>
        </div>
      </FormInfo>
    </Form>

    <div class="mx-auto text-center mt-8 mb-8 text-text text-sm font-normal">
      Select a token to continue
    </div>
    <div class="text-center">
      <SubmitBtn @click="handleAddLiquidity" :disabled="!isAddLiquid">
        Add Liquidity
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
import { investLiquidity } from "@/taquito/contracts/dex";
import { getStorage } from "@/taquito/tezos";
import { ITokenItem } from "@/api/getTokens";
import { calcTezToToken, calcTokenToTez } from "../helpers/convert";
// import { calcTezToToken, calcTokenToTez } from "@/helpers/convert";

@Component({
  components: {
    NavTabs,
    NavInvest,
    Form,
    FormField,
    FormIcon,
    FormInfo,
    SubmitBtn,
  },
})
export default class AddLiquidity extends Vue {
  inputAmount: string = "";
  outputAmount: string = "";
  baker: string = "";
  isAddLiquid: boolean = false;
  private selectedToken: any = {
    token: {},
    storage: {},
    amount: null,
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

  mounted() {
    this.$watch(
      (vm?) => [vm.inputAmount, vm.outputAmount, vm.selectedToken.token],
      () => this.validate()
    );
  }

  onInputAmount(value: string) {
    this.inputAmount = value;
    if (value) {
      this.outputAmount = Object.keys(this.selectedToken.token).length
        ? calcTezToToken(this.selectedToken.storage, value)
        : "";
      return;
    }
    this.inputAmount = "";
  }

  onOutputAmount(value: string) {
    this.outputAmount = value;
    if (value) {
      this.inputAmount = Object.keys(this.selectedToken.token).length
        ? calcTokenToTez(this.selectedToken.storage, value)
        : "";
      return;
    }
    this.outputAmount = "";
  }

  handleAddLiquidity() {
    investLiquidity(
      this.selectedToken.token.exchange,
      this.inputAmount,
      this.outputAmount,
      this.baker
    );
  }

  onSelectToken = async (token: any) => {
    this.selectedToken.setToken = token;
    this.selectedToken.setStorage = await getStorage(token.exchange);
  };

  validate() {
    const { inputAmount, outputAmount, selectedToken } = this;
    if (inputAmount && outputAmount && Object.keys(selectedToken.token).length) {
      this.isAddLiquid = true;
    } else {
      this.isAddLiquid = false;
    }
  }
}
</script>
