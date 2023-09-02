const getDefaultState = () => {
  return {
    activeCampaign: '',
    allCampaigns: [],
    genericData: {
      example: 'any data',
    }
  }
}
const state = getDefaultState()

const getters = {
  getAllCampaigns: (state) => state.allCampaigns,
  getActiveCampaign: (state) => state.activeCampaign,
  getGenericData: (state) => (key) => state.genericData[key],
}

const mutations = {
  resetState (state) {
    Object.assign(state, getDefaultState())
  },
  setActiveCampaign (state, campaignId) {
    state.activeCampaign = campaignId;
  },
  setGenData (state, {key, data}) {
    state.genericData[key] = data;
  },
  setCampaignData (state, campaigns) {
    state.allCampaigns = campaigns.sort((a, b) => parseInt(a.sort) - parseInt(b.sort));
    if (!state.activeCampaign) {
      state.activeCampaign = campaigns[0].campaignId;
    }
  },
}

const actions = { 
  setGenericData ({ commit }, {key, data}) {
    commit('setGenData', {key, data})
  },
  setCampaignData ({ commit }, campaigns) {
    commit('setCampaignData', campaigns)
  },
}

export const campaigns = {
  state,
  getters,
  mutations,
  actions
}