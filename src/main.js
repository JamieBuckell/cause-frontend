import Vue from 'vue'
import router from "./router";
import LightBootstrap from './light-bootstrap-main'
import wysiwyg from "vue-wysiwyg";
// Plugins
import App from './App.vue'
import { store } from './store/index'
import permissions from './plugins/permissions'; 
import moment from 'moment'
import VueSocialSharing from 'vue-social-sharing'

// plugin setup
Vue.use(LightBootstrap)
Vue.use(wysiwyg, {});
Vue.use(permissions);
Vue.use(VueSocialSharing);

Vue.config.productionTip = false
Vue.prototype.$hostname = (process.env.NODE_ENV === 'production') 
                            ? 'https://portal.cause-foundation.org.uk'
                            : 'http://localhost:8082'
Vue.prototype.moment = moment

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store
})
