<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <GovernancePairSelect :selectedToken="selectedToken" v-on:token-selected="selectToken" />

    <Form v-if="selectedToken">
      <NavGovernance />

      <FormField
        placeholder="tz.."
        label="Current candidate"
        :withSelect="false"
        v-model="currentCandidate"
        readonly
      />

      <FormIcon>
        <img src="@/assets/arrow-down.svg" />
      </FormIcon>

      <FormField
        placeholder="tz.."
        label="Next candidate"
        :withSelect="false"
        v-model="nextCandidate"
        readonly
      />

      <FormInfo>
        <div class="flex justify-between mb-1">
          <span>Total share</span>
          <span>100500</span>
        </div>
        <div class="flex justify-between mb-1">
          <span>Your share</span>
          <span>57.36%</span>
        </div>
        <div class="flex justify-between">
          <span>Total votes</span>
          <span>50000</span>
        </div>
      </FormInfo>

      <!-- <div v-if="allKnownBakers">
        {{ allKnownBakers[0].name }}
      </div>-->
    </Form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ITokenItem } from "@/api/getTokens";
import store from "@/store";
import { getAllKnownBakers, BBKnownBaker } from "@/baking-bad";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import GovernancePairSelect from "@/components/GovernancePairSelect.vue";

@Component({
  components: {
    NavTabs,
    NavGovernance,
    Form,
    FormField,
    FormIcon,
    FormInfo,
    GovernancePairSelect,
  },
})
export default class VoteBaker extends Vue {
  currentCandidate: string = "tz1W5VkdB5s7ENMESVBtwyt9kyvLqPcUczRT";
  nextCandidate: string = "tz1NortRftucvAkD1J58L32EhSVrQEWJCEnB";

  allKnownBakers: BBKnownBaker[] = [];

  get selectedToken(): ITokenItem | null {
    const tokenExchange = this.$route.params.token;
    return (
      store.state.tokens.find((t: any) => t.exchange === tokenExchange) || null
    );
  }

  async mounted() {
    try {
      this.allKnownBakers = await getAllKnownBakers();
    } catch (err) {
      console.error(err);
    }
  }

  selectToken(token: ITokenItem) {
    this.$router.replace(`/governance/vote-baker/${token.exchange}`);
  }
}
</script>
