// This mixin contains common functions to add new samples in a table
// It wraps the Vuex store as a computed property which allows set/get from a component
// Components that use this should override the common and experiment headers and provide markup template to edit their values
export const SingleSampleMixin = {
  props: {
    proteins: {
      type: Array,
    },
		containerId: {
			type: Number,
			default: null
		},
    experimentKind: {
      type: String,
    },
    sampleLocation: {
      type: Number,
      default: 1
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
    sampleIndex: function() {
      // Sample location is the 1..192 location
      // Here we want to edit a zero-indexed array
      return this.sampleLocation - 1
    },
    availableProteins: function() {
      return this.proteins.toJSON()
		},
  },
}