import Vue from "vue";
import VueRouter from "vue-router";
import Swap from "@/views/Swap.vue";
import Send from "@/views/Send.vue";
import Invest from "@/views/Invest.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", name: "Swap", component: Swap },
  { path: "/send", name: "Send", component: Send },
  { path: "/invest", name: "AddLiquidity", component: Invest },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;
