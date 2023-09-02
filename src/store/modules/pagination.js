const getDefaultState = () => {
  return {
    data: {
      example: {
        currentPage: 1,
        perPage: 50,
        perPageOptions: [25, 50, 100, 150, 200],
        total: 0,
      },
    }
  }
}
const state = getDefaultState()

const getters = {
  getPaginationData: (state) => (type) => state.data[type],
}

const mutations = {
  setData (state, {type, attributes}) {
    const keys = Object.keys(attributes);
    if (!state.data[type]) {
      state.data[type] = {};
    }
    keys.forEach((key, index) => {
      state.data[type][key] = attributes[key];
    });
  },
}

const actions = {
  setPaginationData ({ commit }, {type, attributes}) {
    commit('setData', {type, attributes})
  },
}

export const pagination = {
  state,
  getters,
  mutations,
  actions
}