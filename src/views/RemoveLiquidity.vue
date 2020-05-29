<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
      <NavInvest />
      <FormField
        label="Pool tokens"
        placeholder="0.0"
        :withTezos="false"
        v-model="inputAmount"
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
        @selectToken="onSelectToken"
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
      <SubmitBtn disabled>
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
import { calcTezToToken, calcTokenToTez } from "@/helpers/calc";
@Component({
  components: { NavTabs, NavInvest, Form, FormField, FormIcon, FormInfo, SubmitBtn },
})
export default class RemoveLiquidity extends Vue {
  inputAmount: string = "";
  outputAmount: string = "";
  baker: string = "";

  private selectedToken: any = {
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

  onInputAmount(value: string) {
    const amount = parseFloat(value);
    if (amount) {
      this.inputAmount = value;
      this.outputAmount = calcTokenToTez(this.selectedToken.storage, amount);
    } else {
      this.inputAmount = "";
    }
  }

  onOutputAmount(value: string) {
    const amount = parseFloat(value);
    if (amount) {
      this.outputAmount = value;
      this.inputAmount = calcTezToToken(this.selectedToken.storage, amount);
    } else {
      this.outputAmount = "";
    }
  }

  handleAddLiquidity() {
    divestLiquidity(this.selectedToken.token.exchange, this.inputAmount, 100, this.baker);
  }

  onSelectToken = async (token: any) => {
    this.selectedToken.setToken = token;
    this.selectedToken.setStorage = await getStorage(token.exchange);
  };
}
</script>
