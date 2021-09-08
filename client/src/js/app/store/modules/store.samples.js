import Sample from 'models/sample'
import Samples from 'collections/samples'

const INITIAL_SAMPLE_STATE = {
  ABUNDANCE: '',
  ANOMALOUSSCATTERER: '',
  BLSUBSAMPLEID: '',
  CODE: '',
  CELL_A: '',
  CELL_B: '',
  CELL_C: '',
  CELL_ALPHA: '',
  CELL_BETA: '',
  CELL_GAMMA: '',
  CENTRINGMETHOD: '',
  COMMENTS: '',
  COMPOSITION: '',
  CONTAINERID: '',
  CRYSTALID: -1,
  DIMENSION1: '',
  DIMENSION2: '',
  DIMENSION3: '',
  ENERGY: '',
  EXPERIMENTALDENSITY: '',
  EXPERIMENTKIND: '',
  LOCATION: '',
  LOOPTYPE: '',
  MINIMUMRESOLUTION: '',
  NAME: '',
  PACKINGFRACTION: '',
  PROTEINID: -1,
  REQUIREDRESOLUTION: '',
  RADIATIONSENSITIVITY: '',
  SCREENCOMPONENTGROUPID: '',
  SCREENINGMETHOD: '',
  SCREENINGCOLLECTVALUE: '',
  THEORETICALDENSITY: '',
  SHAPE: '',
  SPACEGROUP: '',
  SYMBOL: '',
  USERPATH: '',
  VOLUME: '',
}

// Use Location as idAttribute for this table
var LocationSample = Sample.extend({
  idAttribute: 'LOCATION',
  defaults: INITIAL_SAMPLE_STATE
})

const samplesModule = {
  namespaced: true,
  state: {
    // Proposal / visit info
    samples: [],
    samplesCollection: new Samples(), // Backbone model we will use to save,
    containersSamplesGroupData: {
      shipmentId: null,
      dewarId: null,
      containerId: null
    }
  },
  mutations: {
    //
    // Proposal and visit information
    //
    reset(state, capacity) {
      // If capacity is not set, we don't change length just reset the data
      let samplesLength = capacity || state.samples.length

      var samples = Array.from({ length: samplesLength }, (_, i) => new LocationSample({ BLSAMPLEID: null, LOCATION: (i + 1).toString(), PROTEINID: -1, CRYSTALID: -1, new: true }))

      state.samplesCollection.reset(samples)

      state.samples = state.samplesCollection.toJSON().filter(() => { return true })
    },
    setSample(state, { data, index }) {
      if (index < state.samples.length) state.samples[index] = data
    },
    clearSample(state, index) {
      if (index < state.samples.length) {
        let emptySample = INITIAL_SAMPLE_STATE
        let location = index + 1

        emptySample.LOCATION = location.toString()

        state.samples[index] = Object.assign(state.samples[index], emptySample)
      }
    },
    // Update an individual sample property
    update(state, { index, key, value }) {
      if (index < state.samples.length) state.samples[index][key] = value
    },
    // Set all samples to a passed array - convenient when used with forms and computed properties
    set(state, data) {
      if (data.length <= state.samples.length) {
        state.samples = data.map((item) => { return item })
      }
    },
    setContainerSampleGroupData(state, data) {
      state.containersSamplesGroupData = data
    }
  },
  actions: {
    save({ commit, state, dispatch }, containerId) {
      // Convert our samples json to a backbone collection
      state.samples.map(s => {
        s.CONTAINERID = containerId
        let locationIndex = +(s.LOCATION - 1)
        let proteinId = +s.PROTEINID
        if (proteinId > 0 && s.NAME != '') {
          state.samplesCollection.at(locationIndex).set(s)
          return s
        }
      })

      // Now filter for those with valid protein/crystal ids
      let samples = new Samples(state.samplesCollection.filter(function(m) { return m.get('PROTEINID') > - 1 || m.get('CRYSTALID') > - 1 }))

      // Finally save the collection to the server
      return dispatch('saveCollection', { collection: samples }, { root: true })
    },

  },
  getters: {
    samples: state => state.samples,
    getContainerSamplesGroupData: state => state.containersSamplesGroupData
  }
}

export default samplesModule
