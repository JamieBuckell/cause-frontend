import Vue from "vue";
import Vuex from "vuex";
import { authenticate, campaigns, pagination } from "@/store/modules";
import createPersistedState from "vuex-persistedstate";
import Cookies from "js-cookie";
/* */
import SecureLS from "secure-ls";
let ls = new SecureLS({
  encodingType: "aes",
  isCompression: false,
  encryptionSecret: '[8IL$Kc"5JK#9PPcs9R6"|8@@}&-=4',
});
/* */
Vue.use(Vuex);

let secure = process.env.NODE_ENV === "production";

export const store = new Vuex.Store({
  modules: {
    authenticate,
    campaigns,
    pagination,
  },
  plugins: [
    createPersistedState({
      key: "CFLS",
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
      paths: [
        // 'authenticate.userPool',
        // 'authenticate.userData',
        // 'authenticate.tokens',
        // 'authenticate.currentUser',
        // 'authenticate.authChecked',
        "campaigns.allCampaigns",
        "campaigns.activeCampaign",
        "campaigns.platformData",
        "campaigns.genericData",
        "campaigns.lastUpdated",
        "authenticate.timestamps",
        "pagination.data",
        "authenticate.tokens.idToken",
        "authenticate.tokens.accessToken",
        "authenticate.tokens.refreshToken",
      ],
    }),
    createPersistedState({
      key: "CFS",
      storage: {
        getItem: (key) => {
          return Cookies.get(key);
        },
        setItem: (key, value) => {
          Cookies.set(key, value, { expires: 31, secure: secure });
        },
        removeItem: (key) => Cookies.remove(key),
      },
      paths: ["authenticate.currentUser"],
    }),
  ],
});
