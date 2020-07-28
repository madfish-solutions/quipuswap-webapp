import "unfetch/polyfill";

import Vue from "vue";
import VueSimpleAlert from "vue-simple-alert";
import "reflect-metadata";
import * as NP from "number-precision";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";

Vue.config.productionTip = false;
Vue.use(VueSimpleAlert);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");

NP.enableBoundaryChecking(false);
