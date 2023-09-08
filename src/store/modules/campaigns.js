const getDefaultState = () => {
  return {
    activeCampaign: "",
    allCampaigns: [],
    platformData: {},
    genericData: {
      example: "any data",
    },
    lastUpdated: "",
  };
};
const state = getDefaultState();

const getters = {
  getAllCampaigns: (state) => state.allCampaigns,
  getActiveCampaign: (state) => state.activeCampaign,
  getGenericData: (state) => (key) => state.genericData[key],
  getPlatformData: (state) => state.platformData,
  getLastUpdated: (state) => state.lastUpdated,
};

const mutations = {
  resetState(state) {
    Object.assign(state, getDefaultState());
  },
  setActiveCampaign(state, campaignId) {
    state.activeCampaign = campaignId;
  },
  setGenData(state, { key, data }) {
    state.genericData[key] = data;
  },
  setCampaignData(state, campaigns) {
    state.allCampaigns = campaigns.sort(
      (a, b) => parseInt(b.sort) - parseInt(a.sort)
    );
    if (!state.activeCampaign) {
      state.activeCampaign = campaigns[0].campaignId;
    }
  },
  setPlatformData(state, data) {
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
