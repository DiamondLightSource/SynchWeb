// This mixin contains common functions to add new samples in a table
// It wraps the Vuex store as a computed property which allows set/get from a component
// Components that use this should override the common and experiment headers and provide markup template to edit their values
export const SampleTableMixin = {
  props: {
    proteins: {
      type: Array,
    },
    // Passed v-model
    value: {
      type: Object,
      required: true
    },
  },
  data: function() {
    return {
			availableProteins: [],
			// These should be overriden by the component that uses this mixin
			commonSampleHeaders: [],
      experimentHeaders: [],
    }
  },
  computed: {
    // Trick to allow us to set/get passed model
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
		console.log("Sample Table Mixin")
    this.availableProteins = this.proteins.toJSON()
  },
}