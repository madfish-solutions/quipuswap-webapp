import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Swap from "@/views/Swap.vue";
import Send from "@/views/Send.vue";
import AddLiquidity from "@/views/AddLiquidity.vue";
import RemoveLiquidity from "@/views/RemoveLiquidity.vue";
import CreateExchange from "@/views/CreateExchange.vue";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  { path: "/", name: "Swap", component: Swap },
  { path: "/send", name: "Send", component: Send },
  { path: "/invest", redirect: "/invest/add-liquidity" },
  { path: "/invest/add-liquidity", name: "AddLiquidity", component: AddLiquidity },
  { path: "/invest/remove-liquidity", name: "RemoveLiquidity", component: RemoveLiquidity },
  { path: "/invest/create-exchange", name: "CreateExchange", component: CreateExchange },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;
