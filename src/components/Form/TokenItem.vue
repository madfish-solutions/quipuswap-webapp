<template>
  <div class="flex items-center">
    <div class="flex-1">
      <div class="flex items-center">
        <!-- <div class="w-10 h-10 bg-accent rounded-full mr-3"></div> -->
        <img class="w-8 h-8 xs:w-10 xs:h-10 mr-3" :src="token.imgUrl" />
        <div class="flex-1">
          <div class="text-base xs:text-lg font-normal">
            {{ formattedTokenSymbol }}
          </div>
          <div class="text-xs xs:text-sm text-gray-600">{{ name }}</div>
        </div>
      </div>
    </div>
    <div>-</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { QSAsset, isAddressValid } from "@/core";

@Component
export default class TokenItem extends Vue {
  @Prop({ default: "0xBTC" }) symbol!: string;
  @Prop({ default: "0xBitcoin Token" }) name!: string;
  @Prop() token!: QSAsset;

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
