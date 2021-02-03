import "./main.css";

import "reflect-metadata";
import "unfetch/polyfill";

import Vue from "vue";
import VTooltip from "v-tooltip";
import VueSimpleAlert from "vue-simple-alert";
import * as NP from "number-precision";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;
Vue.use(VueSimpleAlert);
Vue.use(VTooltip);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");

NP.enableBoundaryChecking(false);
