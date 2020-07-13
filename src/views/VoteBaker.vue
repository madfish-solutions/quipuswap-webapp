<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />
    <Form>
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

      <div v-if="allKnownBakers">
        {{ allKnownBakers[0].name }}
      </div>
    </Form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { getAllKnownBakers, BBKnownBaker } from "@/baking-bad";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";

@Component({
  components: {
    NavTabs,
    NavGovernance,
    Form,
    FormField,
    FormIcon,
    FormInfo,
  },
})
export default class VoteBaker extends Vue {
  currentCandidate: string = "tz1W5VkdB5s7ENMESVBtwyt9kyvLqPcUczRT";
  nextCandidate: string = "tz1NortRftucvAkD1J58L32EhSVrQEWJCEnB";

  allKnownBakers: BBKnownBaker[] = [];

  async mounted() {
    try {
      this.allKnownBakers = await getAllKnownBakers();
    } catch (err) {
      console.error(err);
    }
  }
}
</script>
