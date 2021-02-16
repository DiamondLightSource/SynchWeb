export default {
  state: {
    selectedSampleGroups: [],
    sampleGroups: []
  },
  getters: {
    getSelectedSampleGroups: state => state.selectedSampleGroups,
    getSampleGroups: state => state.sampleGroups
  },
  mutations: {
    setSampleGroups(state, data) {
      state.sampleGroups = data
    },
    setSelectedSampleGroups(state, data) {
      state.selectedSampleGroups = data
    }
  },
  actions: {
    updateSampleGroupsList({ commit }, payload) {
      commit('setSampleGroups', payload)
    },
    updateSelectedSampleGroups({ }, payload) {
      commit('setSelectedSampleGroups', payload)
    }
  },
  namespaced: true
}