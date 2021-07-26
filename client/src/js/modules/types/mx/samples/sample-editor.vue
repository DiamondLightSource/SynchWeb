<template>
  <!-- This component manages creation of samples. It holds the main array of sample info that will be added to a container -->
  <div class="">
    
    <!-- Wrap the form in an observer component so we can check validation state on submission -->
    <validation-observer ref="sampleObserver">
    
      <!-- Use plate table, single or table depending on capacity -->
      <component
        :is="sampleComponent"
        :proteins="proteins"
        :experimentKind="experimentKind"
        :containerId="containerId"
        :sampleLocation="sampleLocation"
        @save-sample="onSaveSample"
        @clone-sample="onCloneSample"
        @clear-sample="onClearSample"
        @clone-container="onCloneContainer"
        @clear-container="onClearContainer"
        @clone-container-column="onCloneColumn"
        @clone-container-row="onCloneRow"
        @reset-form-validation="resetFormValidation"
      />

    </validation-observer>
  </div>
</template>

<script>
import EventBus from 'app/components/utils/event-bus.js'

import Sample from 'models/sample'
import SingleSample from 'modules/types/saxs/samples/experiments/default/single-sample.vue'
import SamplePlateNew from 'modules/types/mx/samples/sample-plate-new.vue'

import { SampleTableNewMap, SampleTableViewMap } from 'modules/types/saxs/samples/experiments/sample-table-map'

import { ValidationObserver }  from 'vee-validate'

import { mapGetters } from 'vuex'

export default {
  name: 'sample-editor',
  components: {
    'single-sample-plate': SingleSample,
    'validation-observer': ValidationObserver,
    'mx-sample-plate-new': SamplePlateNew
  },
  props: {
    containerType: {
      type: Object,
      required: true
    },
    experimentKind: {
      type: Number
    },
    proteins: {
      type: Array
    },
    gproteins: {
      type: Object
    },
    containerId: {
      type: Number
    }
  },
  data() {
    return {
      sampleLocation: 1,
    }
  },

  computed: {
    sampleComponent: function() {
      // Use a table editor unless capacity > 25
      // If we have been passed a valid container id then we are editing the samples, else new table
      let sampleTableMap = this.containerId ? SampleTableViewMap : SampleTableNewMap
      let experimentType = 'default'

      let component = sampleTableMap[experimentType]

      if (this.containerType.CAPACITY > 25) {
        component = 'single-sample-plate'
      } else {
        component = 'mx-sample-plate-new'
      }

      return component
    },
    // These options will be passed into the marionette sample table view
    ...mapGetters({
      samples: ['samples/samples']
    })
  },
  // We are passing a plain JSON array to the sample plate view
  // So we need to detect when the parent backbone collection is changed (reset)
  // On reset, update our samples list
  created: function() {
    // Parent Add Container component will send a message once it has successfully created the container
    EventBus.$on('save-samples', this.onSaveSamples)
    EventBus.$on('select-sample', this.onSelectSample)
  },
  methods: {
    // We will need to pass up the event to select a sample in case graphic needs to change
    onSelectSample: function(location) {
      console.log("Samples Editor - detected select-sample - " + location)
      this.sampleLocation = +location
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
        this.$store.commit('samples/setSample', { data:Object.assign(this.samples[nextSampleIndex], this.samples[sampleIndex]), index:nextSampleIndex})
        this.$store.commit('samples/update', {index: nextSampleIndex, key: 'LOCATION', value: nextSampleLocation.toString()})
        this.$store.commit('samples/update', {index: nextSampleIndex, key: 'NAME', value: this.generateSampleName(this.samples[sampleIndex].NAME, nextSampleLocation)})
      }
    },
    // Clear row for a single row in the sample table
    onClearSample: function(sampleLocation) {
      let location = +sampleLocation
      // Clear the row for this location
      // Locations should be in range 1..samples.length
      if (location < 1 || location > this.samples.length) { console.log("Sample Editor error clearing sample index"); return }
      // The location is one more than the sample index
      let index = location -1 
      this.$store.commit('samples/clearSample', index)
    },
    // Take first entry (or index) and clone all rows
    onCloneContainer: function(sampleIndex=0) {
      console.log("Clone Container from sample Index = " + sampleIndex)

      for (var i=0; i<this.samples.length; i++) {
        this.cloneSample(sampleIndex, i)
      }
    },
    // Remove all sample information from every row
    onClearContainer: function() {
      for (var i=0; i<this.samples.length; i++) {
        this.$store.commit('samples/clearSample', i)
      }
    },
    // When cloning, take the last digits and pad the new samples names
    // So if 1: sample-01, 2: will equal sample-02 etc.
    generateSampleName: function(name, startAtIndex) {
      if (!name) return null

      let name_base = name.replace(/([\d]+)$/, '')
      let digits = name.match(/([\d]+)$/)
      let number_pad = (digits && digits.length > 1) ? digits[1].length : 0

      let sampleName = name_base+((startAtIndex).toString().padStart(number_pad, '0'))

      return sampleName
    },
    // This gets triggered on successful creation of container
    // Save the samples collection to the database
    // Could add final validation check here, but the container will already exist
    // Better to catch earlier - prevent container add for instance if samples are invalid
    // If we are wrapping this component within a validation observer the submit container step will be prevented
    onSaveSamples: function(containerId) {
      // If no container id we can't correctly add the new samples to the container
      if (!containerId) return

      this.$refs.sampleObserver.validate().then( (result) => {
        if (result) this.saveSamples(containerId)
        else console.log("Error saving samples for container " + containerId)
      })
    },

    saveSamples: function(containerId) {
      this.$store.dispatch('samples/save', containerId).then( () => {
          // If we have a container id we are creating all samples
          // On success, reset because we will want to start with a clean slate
          this.$store.commit('samples/reset')
        }, (err) => {
          this.$store.commit('notifications/addNotification', { message: err.message, level: 'error'})
        })
    },
    
    // Save the sample to the server via backbone model
    // Location should be the sample LOCATION
    onSaveSample: function(location) {
      this.$refs.sampleObserver.validate().then( (result) => {
        console.log("Sample Editor is Valid was: " + result)
        if (result) this.saveSample(location)
        else {
          this.$store.commit('notifications/addNotification', { message: 'Sample data is invalid, please check the form', level: 'error'})
          console.log("Validation failed for sample location: " + location)
        }
      })
    },

    saveSample: function(location) {
      let sampleIndex = +location -1
      // Create a new Sample Model so it uses the BLSAMPLEID to check for post, update etc
      let sampleModel = new Sample( this.samples[sampleIndex] )

      this.$store.dispatch('saveModel', {model: sampleModel}).then( (result) => {
        // Update BLSAMPLEID for this sample in the vuex store
        if (!this.samples[sampleIndex]['BLSAMPLEID']) this.$store.commit('samples/update', {index: sampleIndex, key: 'BLSAMPLEID', value: result.get('BLSAMPLEID')})
      }, (err) => console.log("Error saving model: " + JSON.stringify(err)))
    },
    getRowColDrop: function(pos) {
      let well = this.containerType.WELLDROP > -1 ? 1 : 0
      let dropTotal = (this.containerType.DROPPERWELLX * this.containerType.DROPPERWELLY) - well
      
      var wellpos = Math.floor((parseInt(pos)-1) / dropTotal)
      var drop = ((pos-1) % dropTotal)+1
      
      var col = wellpos % this.containerType.WELLPERROW
      var row = Math.floor(wellpos / this.containerType.WELLPERROW)

      return { row: row, col: col, drop: drop, pos: pos }
    },
    onCloneColumn: function(location) {
      let sampleIndex = +location - 1

      console.log("Current Sample = " + JSON.stringify(this.samples[sampleIndex]))

      let sourceCoordinates = this.getRowColDrop(location)

      console.log("Source coordinates = " + JSON.stringify(sourceCoordinates))
      for (var i=0; i<this.samples.length; i++) {
        // We are only cloning samples that come after this one - so skip any with a lower index
        if (i > sampleIndex) {
          let targetCoordinates = this.getRowColDrop(this.samples[i].LOCATION)
          console.log("Target coordinates = " + JSON.stringify(targetCoordinates))

          if (targetCoordinates['drop'] == sourceCoordinates['drop'] && targetCoordinates['col'] == sourceCoordinates['col']) {
            let result = this.cloneSample(sampleIndex, i)
            if (!result) console.log("Error cloning sample index: " + sampleIndex + " to: " + i)
          }
        }
      }
    },
    onCloneRow: function(location) {
      let sampleIndex = +location - 1

      let sourceCoordinates = this.getRowColDrop(location)

      for (var i=0; i<this.samples.length; i++) {
        // We are only cloning samples that come after this one - so skip any with a lower index
        if (i > sampleIndex) {
          let targetCoordinates = this.getRowColDrop(this.samples[i].LOCATION)
          console.log("Target coordinates = " + JSON.stringify(targetCoordinates))

          if (targetCoordinates['drop'] == sourceCoordinates['drop'] && targetCoordinates['row'] == sourceCoordinates['row']) {
            let result = this.cloneSample(sampleIndex, i)
            if (!result) console.log("Error cloning sample index: " + sampleIndex + " to: " + i)
          }
        }
      }
    },
    cloneSample: function(sourceIndex, targetIndex) {
      if (targetIndex >= this.samples.length) return false
      if (sourceIndex >= this.samples.length) return false

      let sourceSample = this.samples[sourceIndex]
      if (sourceSample.PROTEINID < 0) {
        console.log("Can't clone non-existant sample")
        return false
      }

      let baseName = this.samples[sourceIndex].NAME
      let sampleClone = Object.assign(this.samples[targetIndex], this.samples[sourceIndex])
      sampleClone.LOCATION = (targetIndex+1).toString()
      sampleClone.NAME = this.generateSampleName(baseName, targetIndex+1)
      this.$store.commit('samples/setSample', {index: targetIndex, data: sampleClone})

      // Alternative option if reactivity is not working as we would like...
      // this.$store.commit('samples/setSample', { index:targetIndex, data: Object.assign(this.samples[targetIndex], this.samples[sourceIndex])})
      // this.$store.commit('samples/update', {index: targetIndex, key: 'LOCATION', value: (targetIndex+1).toString()})
      // this.$store.commit('samples/update', {index: targetIndex, key: 'NAME', value: this.generateSampleName(this.samples[sourceIndex].NAME, targetIndex+1)})
      return true
    },
    // Reset the validation for the field when an input is edited
    resetFormValidation() {
      requestAnimationFrame(() => {
        this.$refs.sampleObserver.reset()
      })
    }
  }
}
</script>