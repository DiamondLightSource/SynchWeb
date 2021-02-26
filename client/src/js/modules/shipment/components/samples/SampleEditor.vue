<template>
  <!-- This component manages creation of samples. It holds the main array of sample info that will be added to a container -->
  <div class="">
    <div v-if="showPuckSampleTable" class="table">
      <!-- Currently using old sample table for pucks -->
      <marionette-view
        :key="$route.fullPath"
        :options="options"
        :skipLoad="true"
        :mview="mview">
      </marionette-view>
    </div>
    <div v-else>
      <!-- Use plate table, single or table depending on capacity -->
      <!-- Hardcoding experiment type for testing -->
      <component
        :is="sampleComponent"
        :proteins="proteins"
        v-model="samples"
        :experimentKind="experimentKind"
        :containerId="containerId"
        @clone-sample="onCloneSample"
        @clear-sample="onClearSample"
        @clone-container="onCloneContainer"
        @clear-container="onClearContainer"
        @save-sample="onSaveSamples"
      />
    </div>
  </div>
</template>

<script>
import EventBus from 'app/components/utils/event-bus.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import Sample from 'models/sample'
import Samples from 'collections/samples'
import SampleTableView from 'modules/shipment/views/sampletable'
import SingleSample from 'modules/shipment/components/samples/SingleSample.vue'
import SamplePlateEditor from 'modules/shipment/components/samples/SamplePlateEditor.vue'
import SamplePlateEdit from 'modules/shipment/components/samples/SamplePlateEdit.vue'

// Templates we need to pass to the old MX style sample table
import table from 'templates/shipment/sampletablenew.html'
import row from 'templates/shipment/sampletablerownew.html'

// Use Location as idAttribute for this table
var LocationSample = Sample.extend({
    idAttribute: 'LOCATION',
})

const EXPERIMENT_TYPE_ROBOT = 22
const EXPERIMENT_TYPE_HPLC = 21

const INITIAL_SAMPLE_STATE = {
  LOCATION: '',
  PROTEINID: '-1',
  CRYSTALID: '-1',
  NAME: '',
  TYPE: '',
  VOLUME: '',
  PURIFICATIONCOLUMNID: '',
  ROBOTPLATETEMPERATURE: '',
  EXPOSURETEMPERATURE: '',
  CODE: '',
  SPACEGROUP: '',
  COMMENTS: '',
  ABUNDANCE: '',
  SYMBOL: '',
  CELL_A: '',
  CELL_B: '',
  CELL_C: '',
  CELL_ALPHA: '',
  CELL_BETA: '',
  CELL_GAMMA: '',
  REQUIREDRESOLUTION: '',
  ANOM_NO: '',
  ANOMALOUSSCATTERER: '',
  PACKINGFRACTION: '',
  LOOPTYPE: '',
  DIMENSION1: '',
  DIMENSION2: '',
  DIMENSION3: '',
  SHAPE: '',
  CENTRINGMETHOD: '',
  EXPERIMENTKIND: '',
  ENERGY: '',
  RADIATIONSENSITIVITY: '',
  USERPATH: '',
}


export default {
  name: 'sample-editor',
  components: {
    'marionette-view': MarionetteView,
    'single-sample-plate': SingleSample,
    'sample-plate': SamplePlateEditor,
    'sample-plate-edit': SamplePlateEdit
},
  props: {
    sampleComponent: {
      type: String,
    },
    capacity: {
      type: Number,
    },
    selectedSample: {
      type: Number,
    },
    experimentKind: {
      type: Number
    },
    samplesCollection: {
      type: Object
    },
    proteins: {
      type: Array
    },
    gproteins: {
      type: Object
    },
    automated: {
      type: Boolean,
      default: false
    },
    containerId: {
      type: Number
    }
  },
  watch: {
    sampleComponent: function(newVal) {
      console.log("Sample Editor sample component = " + newVal)
    }
  },
  computed: {
    // These options will be passed into the marionette sample table view
    options: function() {
      return {
        proteins: this.proteins,
        gproteins: this.gproteins,
        collection: this.samplesCollection,
        childTemplate: row,
        template: table,
        auto: this.automated,
      }
    },
    showPuckSampleTable: function() {
      return this.sampleComponent == 'puck' ? true : false
    }
  },
  data() {
    return {
      mview: SampleTableView,
      samples: [],
      experimentKind: EXPERIMENT_TYPE_ROBOT
    }
  },
  // We are passing a plain JSON array to the sample plate view
  // So we need to detect when the parent backbone collection is changed (reset)
  // On reset, update our samples list
  created: function() {
    console.log("Sample Editor created - sampleComponent = " + this.sampleComponent)
    this.samples = this.samplesCollection.toJSON()
    console.log("Sample Editor created - samples = " + JSON.stringify(this.samples))

    // Register callback if collection is reset
    this.samplesCollection.bind('reset', this.updateSamples)

    // Parent Add Container component will send a message once it has successfully created the container
    EventBus.$on('save-samples', this.onSaveSamples)
  },
  methods: {
    // We will need to pass up the event to select a sample in case graphic needs to change
    onSelectSample: function(location) {
      this.$emit('select-sample', location)
    },
    // Callback when parent sample collection is reset
    updateSamples: function() {
      // This should trigger an update to the samples table
      this.samples = Object.assign([], this.samplesCollection.toJSON())
    },
    // Clone the next free row based on the current row
    onCloneSample: function(sampleLocation) {
      // Make sure we are using numbers for locations
      let location = +sampleLocation
      // Take the next sample in the list and copy this data
      // Locations should be in range 1..samples.length-1 (can't clone last sample in list)
      if (location < 1 || location > (this.samples.length-1)) { console.log("Sample Editor error cloning sample index"); return}

      // Sample to be copied and next index
      let sampleIndex = location - 1
      let nextSampleIndex = -1
      // Recreate current behaviour - find the next non-zero protein id
      // This means you can click any row icon and it will fill whatever is the next empty link item based on protein id/valid acronym
      for (var i=location; i<this.samples.length; i++) {
        if ( +this.samples[i]['PROTEINID'] < 0) {
          nextSampleIndex = i
          break
        }
      }
      let nextSampleLocation = nextSampleIndex+1 // LOCATION to be stored in the cloned sample

      if (nextSampleIndex > 0) {
        this.samples[nextSampleIndex] = Object.assign(this.samples[nextSampleIndex], this.samples[sampleIndex])
        this.samples[nextSampleIndex]['LOCATION'] = nextSampleLocation.toString()
        this.samples[nextSampleIndex]['NAME'] = this.generateSampleName(this.samples[sampleIndex].NAME, nextSampleLocation)
      }
    },
    // Clear row for a single row in the sample table
    onClearSample: function(sampleLocation) {
      let location = +sampleLocation
      // Clear the row for this location
      // Locations should be in range 1..samples.length
      if (location < 1 || location > this.samples.length) { console.log("Sample Editor error clearing sample index"); return }

      let emptySample = INITIAL_SAMPLE_STATE
      emptySample.LOCATION = location.toString()

      let sampleIndex = location - 1
      this.samples[sampleIndex] = Object.assign(this.samples[sampleIndex], emptySample)
    },
    // Take first entry and clone all rows
    onCloneContainer: function() {
      let cloneSample = Object.assign({}, this.samples[0])
      let firstName = this.samples[0].NAME
      for (var i=1; i<this.samples.length; i++) {
        cloneSample.LOCATION = (i+1).toString()
        cloneSample.NAME = this.generateSampleName(firstName, i+1)
        this.samples[i] = Object.assign(this.samples[i], cloneSample)
      }
    },
    // Remove all sample information from every row
    onClearContainer: function() {
      let emptySample = INITIAL_SAMPLE_STATE
      for (var i=0; i<this.samples.length; i++) {
        emptySample.LOCATION = (i+1).toString()
        this.samples[i] = Object.assign(this.samples[i], emptySample)
      }
    },
    // When cloning, take the last digits and pad the new samples names
    // So if 1: sample-01, 2: will equal sample-02 etc.
    generateSampleName: function(name, startAtIndex) {
      let name_base = name.replace(/([\d]+)$/, '')
      let digits = name.match(/([\d]+)$/)
      let number_pad = digits[1].length || 0

      let sampleName = name_base+((startAtIndex).toString().padStart(number_pad, '0'))

      return sampleName
    },
    // This gets triggered on successful creation of container
    // Save the samples collection to the database
    // Could add final validation check here, but the container will already exist
    // Better to catch earlier - prevent container add for instance if samples are invalid
    // If we are wrapping this component within a validation observer the submit container step will be prevented
    onSaveSamples: function(containerId) {
      // Iterate through our JSON representation of the samples list,
      // for those with a valid (non-zero) protein id set the corresponding collection data
      // We actually don't use the return value, merely use the map to iterate through the array
      // Also used by plate editor to update samples if changed
      if (containerId) {
        // New samples added
        this.samples.map(s => {
          s.CONTAINERID = containerId
          let locationIndex = +(s.LOCATION - 1)
          let proteinId = +s.PROTEINID
          if (proteinId > 0 && s.NAME != '') {
            this.samplesCollection.at(locationIndex).set(s)
            return s
          }
        })
      } else {
        console.log("Sample editor update samples: " + JSON.stringify(this.samples))
        // Update collection
        this.samples.map(s => {
          let locationIndex = +(s.LOCATION - 1)
          console.log("Location: " + locationIndex)
          this.samplesCollection.at(locationIndex).set(s)
        })
      }

      console.log("Sample editor samples COLLECTION: " + JSON.stringify(this.samplesCollection.toJSON()))
      let samples = new Samples(this.samplesCollection.filter(function(m) { return m.get('PROTEINID') > - 1 || m.get('CRYSTALID') > - 1 }))

      this.$store.dispatch('saveCollection', samples).then( (result) => {
        console.log("Sample Editor saved collection: " + JSON.stringify(result))
        if (containerId) this.resetSamples(this.samplesCollection.length)
        // else this.refreshSamples(result)
      })
    },
    resetSamples: function(capacity) {
      var samples = Array.from({length: capacity}, (_,i) => new LocationSample({ LOCATION: (i+1).toString(), PROTEINID: -1, CRYSTALID: -1, new: true }))

      this.samplesCollection.reset(samples)
    },
    // Reset Backbone Samples Collection
    refreshSamples: function(collection) {
      // Need to figure this part out...
      // Force a refresh - updates the protein acronym..?
      // this.$router.go()
      collection.each( s => {
        let i = +(s.get('LOCATION')) - 1
        this.samples[i] = Object.assign({}, s)
      })
    },

  },


}
</script>