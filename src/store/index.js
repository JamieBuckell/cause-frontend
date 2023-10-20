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

const getStorageData = (key) => {
  const totalChunks = ls.get(`${key}-totalChunks`);
  if (totalChunks > 0) {
    let chunkedData = [];
    for (let i = 0; i <= totalChunks; i++) {
      const chunk = ls.get(`${key}-${i}`);
      if (chunk.length) {
        chunkedData = [...chunkedData, ...JSON.parse(chunk)];
      }
    }
    return JSON.stringify({
      campaigns: { platformFamilies: chunkedData },
    });
  } else {
    return ls.get(key);
  }
};

const setStorageData = (key, value) => {
  const data = JSON.parse(value);
  const chunkSize = 500;
  if (
    data?.campaigns?.platformFamilies &&
    data.campaigns.platformFamilies.length > chunkSize
  ) {
    const families = [...data.campaigns.platformFamilies];
    var totalChunks = 0;
    for (let i = 0; i < families.length; i += chunkSize) {
      totalChunks++;
      const chunk = families.slice(i, i + chunkSize);
      ls.set(`${key}-${totalChunks}`, JSON.stringify(chunk));
    }
    return ls.set(`${key}-totalChunks`, totalChunks);
  } else {
    return ls.set(key, value);
  }
};

const removeStorageData = (key) => {
  const totalChunks = ls.get(`${key}-totalChunks`);
  if (totalChunks > 0) {
    for (let i = 0; i <= totalChunks; i++) {
      ls.remove(`${key}-${i}`);
    }
    return true;
  } else {
    return ls.remove(key);
  }
};

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
        // "campaigns.platformData",
        "campaigns.platformCampaignId",
        "campaigns.allCampaigns",
        "campaigns.activeCampaign",
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
      key: "CFDLS",
      storage: {
        getItem: (key) => getStorageData(key),
        setItem: (key, value) => setStorageData(key, value),
        removeItem: (key) => removeStorageData(key),
      },
      paths: ["campaigns.platformDonors"],
    }),
    createPersistedState({
      key: "CFNLS",
      storage: {
        getItem: (key) => getStorageData(key),
        setItem: (key, value) => setStorageData(key, value),
        removeItem: (key) => removeStorageData(key),
      },
      paths: ["campaigns.platformNominators"],
    }),
    createPersistedState({
      key: "CFOLS",
      storage: {
        getItem: (key) => getStorageData(key),
        setItem: (key, value) => setStorageData(key, value),
        removeItem: (key) => removeStorageData(key),
      },
      paths: ["campaigns.platformOrganisations"],
    }),
    createPersistedState({
      key: "CFSLS",
      storage: {
        getItem: (key) => getStorageData(key),
        setItem: (key, value) => setStorageData(key, value),
        removeItem: (key) => removeStorageData(key),
      },
      paths: ["campaigns.platformSubscribers"],
    }),
    createPersistedState({
      key: "CFFLS",
      storage: {
        getItem: (key) => getStorageData(key),
        setItem: (key, value) => setStorageData(key, value),
        removeItem: (key) => removeStorageData(key),
      },
      paths: ["campaigns.platformFamilies"],
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
