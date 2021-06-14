export default {
  state: {
    selectedSampleGroups: {},
    sampleGroups: [],
    sampleGroupsContainers: [],
    selectedSampleGroupName: ''
  },
  getters: {
    getSelectedSampleGroups: state => state.selectedSampleGroups,
    getSampleGroups: state => state.sampleGroups,
    getSelectedSampleGroupName: state => state.selectedSampleGroupName
  },
  mutations: {
    setSampleGroups(state, data) {
      state.sampleGroups = data
    },
    setSelectedSampleGroups(state, data) {
      state.selectedSampleGroups = { ...state.selectedSampleGroups, ...data }
    },
    setSelectedSampleGroupName(state, data) {
      state.selectedSampleGroupName = data
    },
    resetSelectedSampleGroups(state) {
      state.selectedSampleGroups = {}
    }
  },
  actions: {},
  namespaced: true
}