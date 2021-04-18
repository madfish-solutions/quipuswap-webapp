import "vue-toastification/dist/index.css";
import "./main.css";

import "reflect-metadata";
import "unfetch/polyfill";

import Vue from "vue";
import VueSimpleAlert from "vue-simple-alert";
import * as NP from "number-precision";
import Toast from "vue-toastification";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;
Vue.use(VueSimpleAlert);
Vue.use(Toast, {
  position: "bottom-right",
  transition: "Vue-Toastification__fade",
});

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");

NP.enableBoundaryChecking(false);
