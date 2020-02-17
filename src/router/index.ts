import Vue from "vue";
import VueRouter from "vue-router";
import Swap from "@/views/Swap.vue";
import Send from "@/views/Send.vue";
import AddLiquidity from "@/views/AddLiquidity.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", name: "Swap", component: Swap },
  { path: "/send", name: "Send", component: Send },
  { path: "/add-liquidity", name: "AddLiquidity", component: AddLiquidity },
];

const router = new VueRouter({
  routes,
});

export default router;
