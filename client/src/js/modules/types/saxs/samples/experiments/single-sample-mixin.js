// This mixin contains common functions to add new samples in a table
// It wraps the Vuex store as a computed property which allows set/get from a component
// Components that use this should override the common and experiment headers and provide markup template to edit their values
export const SingleSampleMixin = {
  props: {
    proteins: {
      type: Array,
    },
    // Passed v-model
    value: {
      type: Object,
      required: true
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
    inputValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
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
		isEditContainer: function () {
			return this.containerId != null
		}
  },
	created: function () {
		console.log("Single Sample Mixin")
    // this.availableProteins = this.proteins.toJSON()
  },
}