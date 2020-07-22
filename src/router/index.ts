import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
// import Swap from "@/views/Swap.vue";
import Send from "@/views/Send.vue";
import AddLiquidity from "@/views/AddLiquidity.vue";
import RemoveLiquidity from "@/views/RemoveLiquidity.vue";
import CreateExchange from "@/views/CreateExchange.vue";
import VoteBaker from "@/views/VoteBaker.vue";
import DelegateVote from "@/views/DelegateVote.vue";
import Veta from "@/views/Veta.vue";
import Rewards from "@/views/Rewards.vue";
import SwapOrSend from "@/components/SwapOrSend.vue";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  { path: "/", name: "Swap", component: SwapOrSend },
  { path: "/send", name: "Send", component: Send },
  { path: "/invest", redirect: "/invest/add-liquidity" },
  { path: "/invest/add-liquidity", name: "AddLiquidity", component: AddLiquidity },
  { path: "/invest/remove-liquidity", name: "RemoveLiquidity", component: RemoveLiquidity },
  { path: "/invest/create-exchange", name: "CreateExchange", component: CreateExchange },
  { path: "/governance", redirect: "/governance/vote-baker" },
  { path: "/governance/vote-baker/:token?", name: "VoteBaker", component: VoteBaker },
  { path: "/governance/delegate-vote/:token?", name: "DelegateVote", component: DelegateVote },
  { path: "/governance/veta/:token?", name: "Veta", component: Veta },
  { path: "/governance/rewards/:token?", name: "Rewards", component: Rewards },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;
