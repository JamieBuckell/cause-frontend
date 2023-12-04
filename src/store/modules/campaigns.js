const getDefaultState = () => {
  return {
    activeCampaign: "",
    allCampaigns: [],
    platformCampaignId: "",
    platformDonors: [],
    platformNominators: [],
    platformOrganisations: [],
    platformSubscribers: [],
    genericData: {
      example: "any data",
    },
    lastUpdated: "",
    forceRefresh: false,
    isLoading: false,
  };
};
const state = getDefaultState();

const getters = {
  getAllCampaigns: (state) => state.allCampaigns,
  getIsLoading: (state) => state.isLoading,
  getForceRefresh: (state) => state.forceRefresh,
  getActiveCampaign: (state) => state.activeCampaign,
  getGenericData: (state) => (key) => state.genericData[key],
  getPlatformData: (state) => ({
    campaignId: state.platformCampaignId,
    donors: state.platformDonors,
    nominators: state.platformNominators,
    organisations: state.platformOrganisations,
    subscribers: state.platformSubscribers,
  }),
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
  setIsLoading(state, isLoading) {
    state.isLoading = isLoading;
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
    if (data?.donors) {
      state.platformDonors = data.donors;
    }
    if (data?.nominators) {
      state.platformNominators = data.nominators;
    }
    if (data?.organisations) {
      state.platformOrganisations = data.organisations;
    }
    if (data?.subscribers) {
      state.platformSubscribers = data.subscribers;
    }
    state.platformCampaignId = data.campaignId;
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
