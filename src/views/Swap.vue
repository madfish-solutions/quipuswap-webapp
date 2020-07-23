<template>
  <SwapOrSend />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SwapOrSend from "@/components/SwapOrSend.vue";

@Component({
  components: { SwapOrSend },
})
export default class Swap extends Vue {}
</script>
