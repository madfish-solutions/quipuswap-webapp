<template>
  <div class="flex items-center">
    <div class="flex-1">
      <div class="flex items-center">
        <!-- <div class="w-10 h-10 bg-accent rounded-full mr-3"></div> -->
        <img class="w-8 h-8 xs:w-10 xs:h-10 mr-3" :src="imgUrl" />
        <div class="flex-1">
          <div class="text-base xs:text-lg font-normal">{{ symbol }}</div>
          <div class="text-xs xs:text-sm  text-gray-600">{{ name }}</div>
        </div>
      </div>
    </div>
    <div>-</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class TokenItem extends Vue {
  @Prop({ default: "0xBTC" }) symbol!: string;
  @Prop({ default: "0xBitcoin Token" }) name!: string;
  @Prop({
    default:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  })
  imgUrl!: string;
}
</script>
