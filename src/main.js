import Vue from "vue";
import router from "./router";
import LightBootstrap from "./light-bootstrap-main";
import wysiwyg from "vue-wysiwyg";
// Plugins
import App from "./App.vue";
import { store } from "./store/index";
import permissions from "./plugins/permissions";
import moment from "moment";
import VueSocialSharing from "vue-social-sharing";
import * as Sentry from "@sentry/vue";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    Vue,
    dsn: "https://545dea5d3e63ea35e8b566787a6c2706@o4505988076011520.ingest.sentry.io/4505988079812608",
    integrations: [new Sentry.Replay()],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

// plugin setup
Vue.use(LightBootstrap);
Vue.use(wysiwyg, {});
Vue.use(permissions);
Vue.use(VueSocialSharing);

Vue.config.productionTip = false;
Vue.prototype.$hostname =
  process.env.NODE_ENV === "production"
    ? "https://portal.cause-foundation.org.uk"
    : "http://localhost:4000";
Vue.prototype.moment = moment;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: (h) => h(App),
  router,
  store,
});
