// This mixin contains common functions to add new samples in a table and edit rows in a view
// It wraps the Vuex store as a computed property which allows set/get from a component
// Components that use this should override the common and experiment headers and provide markup template to edit their values
export const SampleTableMixin = {
  props: {
    proteins: {
      type: Array,
    },
  },
  data: function() {
    return {
			availableProteins: [],
			// These should be overriden by the component that uses this mixin
			commonSampleHeaders: [],
      experimentHeaders: [],

      // When editing a row we use a temporary sample object as the model
      // Then if we cancel the edit, the original row data is not changed
      editRowLocation: '',
      sample: {},
    }
  },
  computed: {
    // Trick to allow us to set/get passed model from vuex store
    inputValue: {
      get() {
        return this.$store.state.samples.samples
      },
      set(val) {
        this.$store.commit('samples/set', val)
      }
		},
    // Depending on the experiment type, we need a different table structure
    sampleHeaders: function() {
      let headers = Object.assign([], this.commonSampleHeaders)

      for (var i=0; i<this.experimentHeaders.length; i++) headers.push(this.experimentHeaders[i])
      
      return headers
    },
  },
	created: function () {
    this.availableProteins = this.proteins.toJSON()
  },
  methods: {
    onSaveSample: function (row) {
      // Event triggered by confirmation of row edit
      // Locations start from 1, we want index into the samples array
      let location = row['LOCATION']
      let sampleIndex = +location - 1
      // The ACRONYM is determined by the PROTEINID
      // To keep our table updated in the UI set the acronym here as well
      // Means we don't need to refresh the table after saving data to the server
      this.sample.ACRONYM = this.getProteinAcronym(this.sample.PROTEINID)
      // Save the sample data to the store and trigger save to the server
      this.$store.commit('samples/setSample', {index: sampleIndex, data: this.sample})
      this.saveSample(location)
      // Reset the local sample data to start clean on next edit
      this.resetSampleToEdit()
    },

    onEditSample: function(row) {
      this.sample = Object.assign(this.sample, row)
      // Set the sample container id - this will work if we are adding a new sample in the table or editing an existing one
      this.sample.CONTAINERID = this.containerId
      this.editRowLocation = row['LOCATION']
    },

    onCancelEdit: function() {
      this.resetSampleToEdit()
    },

    saveSample: function (location) {
      // Delegating the save to the server to parent sample-editor
      this.$emit('save-sample', location)
    },

    resetSampleToEdit: function() {
      this.editRowLocation = ''
      // Reset temporary sample model
      this.sample = Object.assign({})
    },

    isEditRowLocation: function (row) {
      // Used to indicate if the provided row should show in edit mode
      if (!row['LOCATION']) return false
      return this.editRowLocation == row['LOCATION'] ? true : false
    },

    // If a proteinId is updated we need to also update the text ACRONYM because its a plan text value
    // and not linked directly to the protein id value for each sample
    getProteinAcronym: function(id) {
      let protein = this.proteins.findWhere({PROTEINID: id})
      if (protein) return protein.get('ACRONYM')
      else return null
    },
  }
}