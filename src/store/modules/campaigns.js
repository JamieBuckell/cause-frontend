const getDefaultState = () => {
  return {
    activeCampaign: "",
    allCampaigns: [],
    platformData: {},
    platformFamilies: [],
    genericData: {
      example: "any data",
    },
    lastUpdated: "",
    forceRefresh: false,
  };
};
const state = getDefaultState();

const getters = {
  getAllCampaigns: (state) => state.allCampaigns,
  getForceRefresh: (state) => state.forceRefresh,
  getActiveCampaign: (state) => state.activeCampaign,
  getGenericData: (state) => (key) => state.genericData[key],
  getPlatformData: (state) => state.platformData,
  getPlatformFamilies: (state) => state.platformFamilies,
  getLastUpdated: (state) => state.lastUpdated,
};

const mutations = {
  resetState(state) {
    Object.assign(state, getDefaultState());
  },
  setActiveCampaign(state, campaignId) {
    state.activeCampaign = campaignId;
  },
  setForceRefresh(state, forceRefresh) {
    state.forceRefresh = forceRefresh;
  },
  setGenData(state, { key, data }) {
    state.genericData[key] = data;
  },
  setCampaignData(state, campaigns) {
    state.allCampaigns = campaigns?.sort(
      (a, b) => parseInt(b?.sort ?? 0) - parseInt(a?.sort ?? 0)
    );
    if (!state.activeCampaign) {
      state.activeCampaign = campaigns[0].campaignId;
    }
  },
  setPlatformData(state, data) {
    state.platformFamilies = data.families;
    // delete data.families;
    state.platformData = data;
    state.platformData.campaignId = state.activeCampaign;
    state.lastUpdated = new Date().getTime() / 1000;
  },
};

const actions = {
  setGenericData({ commit }, { key, data }) {
    commit("setGenData", { key, data });
  },
  setCampaignData({ commit }, campaigns) {
    commit("setCampaignData", campaigns);
  },
  setPlatformData({ commit }, data) {
    commit("setPlatformData", data);
  },
};

export const campaigns = {
  state,
  getters,
  mutations,
  actions,
};
