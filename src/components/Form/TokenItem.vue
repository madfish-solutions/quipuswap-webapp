<template>
  <div class="flex items-center">
    <div class="flex-1">
      <div class="flex items-center">
        <!-- <div class="w-10 h-10 mr-3 rounded-full bg-accent"></div> -->
        <img class="w-8 h-8 mr-3 xs:w-10 xs:h-10" :src="token.imgUrl" />
        <div class="flex-1">
          <div class="text-base font-normal xs:text-lg">
            {{ formattedTokenSymbol }}
          </div>
          <div class="text-xs text-gray-600 xs:text-sm">{{ name }}</div>
        </div>
      </div>
    </div>
    <div>-</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { isAddressValid } from "@/core";

@Component
export default class TokenItem extends Vue {
  @Prop({ default: "0xBTC" }) symbol!: string;
  @Prop({ default: "0xBitcoin Token" }) name!: string;
  @Prop() token!: any;

  type!: string;

  get formattedTokenSymbol() {
    if (!this.token) return "";
    const term = this.token.symbol;
    if (isAddressValid(term)) {
      const ln = term.length;
      return [term.slice(0, 7), "...", term.slice(ln - 4, ln)].join("");
    } else return term;
  }
}
</script>
