<template>
  <div class="max-w-xl mx-auto">
    <NavTabs class="mb-6" />

    <GovernancePairSelect :selectedToken="selectedToken" v-on:token-selected="selectToken" />

    <template v-if="selectedToken">
      <Form>
        <NavGovernance />

        <FormField
          placeholder="tz1v7h3s..."
          label="Deputy"
          :withSelect="false"
          v-model="deputy"
          v-on:input="deputy = $event.target.value"
          :spellcheck="false"
        />

        <FormInfo>
          <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>
        </FormInfo>
      </Form>

      <div class="mt-4 flex justify-center align-center text-center">
        <SubmitBtn :disabled="!readyToAddDeputy" @click="handleAdd">
          <template v-if="!adding">{{ addStatus }}</template>
          <template v-if="adding">
            <Loader size="large" />
          </template>
        </SubmitBtn>
      </div>

      <Form class="mt-8">
        <h1 class="text-xl text-center p-4">Already trusted deputies</h1>

        <ul>
          <li class="flex items-center"></li>
        </ul>
      </Form>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ITokenItem } from "@/api/getTokens";
import { getStorage, isAddressValid, useThanosWallet } from "@/taquito/tezos";
import store, { getAccount } from "@/store";
import NavTabs from "@/components/NavTabs.vue";
import NavGovernance from "@/components/NavGovernance.vue";
import Form, { FormField, FormIcon, FormInfo } from "@/components/Form";
import SubmitBtn from "@/components/SubmitBtn.vue";
import Loader from "@/components/Loader.vue";
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
    SubmitBtn,
    Loader,
  },
})
export default class DelegateVote extends Vue {
  deputy: string = "";

  isLoading: boolean = false;

  readyToAddDeputy: boolean = false;
  adding: boolean = false;
  addStatus: string = "Add Deputy";

  get account() {
    return getAccount();
  }

  get selectedToken(): ITokenItem | null {
    const tokenExchange = this.$route.params.token;
    return (
      store.state.tokens.find((t: any) => t.exchange === tokenExchange) || null
    );
  }

  created() {
    this.loadData();
  }

  mounted() {
    this.$watch(
      (vm?) => [vm.selectedToken, vm.account],
      () => this.loadData()
    );

    this.$watch(
      (vm?) => [vm.deputy],
      () => this.validateDeputy()
    );
  }

  async loadData() {
    if (!this.selectedToken) return;

    this.isLoading = true;
    try {
      // const storage = await getStorage(this.selectedToken.exchange);
      // this.currentCandidate = storage.currentDelegated || "-";
      // this.nextCandidate = storage.delegated || "-";
      // this.totalShares = storage.totalShares;
      // this.totalVotes = storage.totalVotes;
      // const me = this.account.pkh || "";
      // if (me) {
      //   const [myShares, myCandidate] = await Promise.all([
      //     storage.shares.get(me),
      //     storage.voters.get(me),
      //   ]);
      //   this.yourShares = myShares ? +myShares : null;
      //   this.yourCandidate = myCandidate ? myCandidate.candidate : "-";
      // }
      // this.voter = me;
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  selectToken(token: ITokenItem) {
    this.$router.replace(`/governance/delegate-vote/${token.exchange}`);
  }

  validateDeputy() {
    this.readyToAddDeputy = isAddressValid(this.deputy);
  }

  async handleAdd() {
    this.adding = true;
    try {
      const tezos = await useThanosWallet();
      const contract = await tezos.wallet.at(this.selectedToken!.exchange);
      const operation = await contract.methods
        .use(6, "setVotesDelegation", this.deputy, true)
        .send();
      await operation.confirmation();

      this.addStatus = "Done!";
    } catch (err) {
      console.error(err);
      this.addStatus = "Failed";
    } finally {
      this.adding = false;
      await new Promise(r => setTimeout(r, 5000));
      this.addStatus = "Add Deputy";
    }
  }
}
</script>
