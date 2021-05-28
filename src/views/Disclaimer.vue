<template>
  <div class="max-w-xl mx-auto wrapper">
    <NavTabs class="mb-6" />
    <h1>Quipuswap protocol disclaimer</h1>
    <p>
      Quipuswap is a decentralized peer-to-peer protocol that people can use to
      create liquidity and trade FA2, FA1,2 tokens. Quipuswap is made up of
      free, public, open-source or source-available software including a set of
      smart contracts that are deployed on the Tezos Blockchain. Your use of the
      Quipuswap protocol involves various risks, including, but not limited to,
      losses while digital assets are being supplied to the Quipuswap protocol
      and losses due to the fluctuation of prices of tokens in a trading pair or
      liquidity pool. Before using the Quipuswap protocol, you should review the
      relevant documentation to make sure you understand how the Quipuswap
      protocol works. Additionally, just as you can access email protocols such
      as SMTP through multiple email clients, you can access the Quipuswap
      protocol through dozens of web or mobile interfaces. You are responsible
      for doing your own diligence on those interfaces to understand the fees
      and risks they present.
    </p>
    <p>
      Although Madfish.solutions developed much of the initial code for the
      Quipuswap protocol, it does not provide, own, or control the Quipuswap
      protocol, which is run by smart contracts deployed on the Tezos
      blockchain. No developer or entity involved in creating the Quipuswap
      protocol will be liable for any claims or damages whatsoever associated
      with your use, inability to use, or your interaction with other users of,
      the Quipuswap protocol, including any direct, indirect, incidental,
      special, exemplary, punitive or consequential damages, or loss of profits,
      cryptocurrencies, tokens, or anything else of value.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavTabs from "@/components/NavTabs.vue";

@Component({
  components: {
    NavTabs,
  },
})
export default class Disclaimer extends Vue {}
</script>

<style lang="postcss" scoped>
.wrapper {
  color: #ffffff;
}
.wrapper h1 {
  text-align: center;
  margin-top: 32px;
  margin-bottom: 24px;
  font-size: 32px;
  font-weight: bold;
}
.wrapper p:not(:last-child) {
  margin-bottom: 16px;
}
</style>
