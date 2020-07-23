<template>
  <SwapOrSend send />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SwapOrSend from "@/components/SwapOrSend.vue";

@Component({
  components: { SwapOrSend },
})
export default class Send extends Vue {}
</script>
