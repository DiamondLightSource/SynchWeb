<template>
  <!-- This component manages creation of samples. It holds the main array of sample info that will be added to a container -->
  <div class="">
    
    <!-- Wrap the form in an observer component so we can check validation state on submission -->
    <validation-observer ref="sampleObserver" v-slot="{ invalid, errors }">
      <!-- Use plate table, single or table depending on capacity -->
      <component
        ref="samples"
        :is="sampleComponent"
        :proteins="proteins"
        :experimentKind="experimentKind"
        :containerId="containerId"
        @save-sample="onSaveSample"
        @clone-sample="onCloneSample"
        @clear-sample="onClearSample"
        @clone-container="onCloneContainer"
        @clear-container="onClearContainer"
        @clone-container-column="onCloneColumn"
        @clone-container-row="onCloneRow"
        @reset-form-validation="resetFormValidation"
      />

      <div class="tw-w-full tw-bg-red-200 tw-border tw-border-red-500 tw-rounded tw-p-1 tw-mb-4" v-show="invalid">
        <p class="tw-font-bold">Please fix the errors on the form</p>
        <div v-for="(error, index) in errors" :key="index">
          <p v-show="error.length > 0" class="tw-black">{{error[0]}}</p>
        </div>
      </div>
    </validation-observer>
  </div>
</template>

<script>
import Sample from 'models/sample'
import SingleSample from 'modules/types/mx/samples/single-sample.vue'
import SamplePlate from 'js/modules/types/mx/samples/samples-plate.vue'

import { ValidationObserver }  from 'vee-validate'

import { mapGetters } from 'vuex'

export default {
  name: 'sample-editor',
  components: {
    'single-sample-plate': SingleSample,
    'validation-observer': ValidationObserver,
    'mx-sample-plate': SamplePlate
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
    containerId: {
      type: Number
    }
  },
  data() {
    return {}
  },
  computed: {
    sampleComponent() {
      // Use a table editor unless capacity > 25
      // If we have been passed a valid container id then we are editing the samples, else new table

      return this.containerType.CAPACITY > 25 ? 'single-sample-plate' : 'mx-sample-plate'
    },
    // These options will be passed into the marionette sample table view
    ...mapGetters({
      samples: ['samples/samples']
    })
  },
  methods: {
    // Clone the next free row based on the current row
    onCloneSample(sampleLocation) {
      // Make sure we are using numbers for locations
      let location = +sampleLocation
      // Take the next sample in the list and copy this data
      // Locations should be in range 1..samples.length-1 (can't clone last sample in list)
      if (location < 1 || location > (this.samples.length-1)) return

      // Sample to be copied and next index
      let nextSampleIndex = -1
      // Recreate current behaviour - find the next non-zero protein id
      // This means you can click any row icon and it will fill whatever is the next empty link item based on protein id/valid acronym
      for (let i = location; i < this.samples.length; i++) {
        if (+this.samples[i]['PROTEINID'] < 0) {
          nextSampleIndex = i
          break
        }
      }

      this.cloneSample(location, nextSampleIndex)
    },
    // Clear row for a single row in the sample table
    onClearSample(sampleLocation) {
      let location = +sampleLocation
      // Clear the row for this location
      // Locations should be in range 1..samples.length
      if (location < 1 || location > this.samples.length) return
      // The location is one more than the sample index
      let index = location - 1 
      this.$store.commit('samples/clearSample', index)
    },
    // Take first entry (or index) and clone all rows
    onCloneContainer(sampleIndex=0) {
      for (let i=0; i < this.samples.length; i++) {
        this.cloneSample(sampleIndex, i)
      }
    },
    // Remove all sample information from every row
    onClearContainer() {
      for (let i=0; i<this.samples.length; i++) {
        this.$store.commit('samples/clearSample', i)
      }
    },
    // When cloning, take the last digits and pad the new samples names
    // So if 1: sample-01, 2: will equal sample-02 etc.
    generateSampleName(name, startAtIndex) {
      if (!name) return null

      let name_base = name.replace(/([\d]+)$/, '')
      let digits = name.match(/([\d]+)$/)
      let number_pad = (digits && digits.length > 1) ? digits[1].length : 0

      let sampleName = name_base+((startAtIndex).toString().padStart(number_pad, '0'))

      return sampleName
    },
    // Save the sample to the server via backbone model
    // Location should be the sample LOCATION
    async onSaveSample(location) {
      const result = await this.$refs.sampleObserver.validate()
      if (result) {
        await this.saveSample(location)
        this.$refs.samples.closeSampleEditing()
      }
      else {
        this.$store.commit('notifications/addNotification', { message: 'Sample data is invalid, please check the form', level: 'error'})
      }
    },
    async saveSample(location) {
      let sampleIndex = +location
      // Create a new Sample Model so it uses the BLSAMPLEID to check for post, update etc
      let sampleModel = new Sample( this.samples[sampleIndex] )

      const result = await this.$store.dispatch('saveModel', { model: sampleModel })

      if (!this.samples[sampleIndex]['BLSAMPLEID'])
        this.$store.commit('samples/updateSamplesField', {
          path: `samples/${sampleIndex}/BLSAMPLEID`,
          value: result.get('BLSAMPLEID')
        })
    },
    getRowColDrop(pos) {
      let well = this.containerType.WELLDROP > -1 ? 1 : 0
      let dropTotal = (this.containerType.DROPPERWELLX * this.containerType.DROPPERWELLY) - well

      const wellPosition = Math.floor((parseInt(pos) - 1) / dropTotal);
      const drop = ((pos - 1) % dropTotal) + 1;

      const col = wellPosition % this.containerType.WELLPERROW;
      const row = Math.floor(wellPosition / this.containerType.WELLPERROW);

      return { row: row, col: col, drop: drop, pos: pos }
    },
    // While updating the sample locations during the cloning, the update will stop is one of the form field is invalid.
    async onCloneColumn(location) {
      let sampleIndex = +location - 1
      let sourceCoordinates = this.getRowColDrop(location)

      for (let i = 0; i < this.samples.length; i++) {
        // We are only cloning samples that come after this one - so skip any with a lower index
        if (i > sampleIndex) {
          let targetCoordinates = this.getRowColDrop(this.samples[i].LOCATION)

          if (targetCoordinates['drop'] == sourceCoordinates['drop'] && targetCoordinates['col'] == sourceCoordinates['col']) {
            this.cloneSample(sampleIndex, i)
            this.$emit('update-location', i)

            await this.$nextTick()
            const locationValid = await this.$refs.sampleObserver.validate();

            if (!locationValid) {
              break
            } else {
              this.$store.commit('samples/updateSamplesField', {
                path: `samples/${sampleIndex}/VALID`,
                value: 1
              })
            }
          }
        }
      }
    },
    // While updating the sample locations during the cloning, the update will stop is one of the form field is invalid.
    async onCloneRow(location) {
      let sampleIndex = +location - 1
      let sourceCoordinates = this.getRowColDrop(location)

      for (let i = 0; i < this.samples.length; i++) {
        // We are only cloning samples that come after this one - so skip any with a lower index
        if (i > sampleIndex) {
          let targetCoordinates = this.getRowColDrop(this.samples[i].LOCATION)

          if (targetCoordinates['drop'] == sourceCoordinates['drop'] && targetCoordinates['row'] == sourceCoordinates['row']) {
            this.cloneSample(sampleIndex, i)
            this.$emit('update-location', i)

            await this.$nextTick()
            const locationValid = await this.$refs.sampleObserver.validate();

            if (!locationValid) {
              break
            } else {
              this.$store.commit('samples/updateSamplesField', {
                path: `samples/${sampleIndex}/VALID`,
                value: 1
              })
            }
          }
        }
      }
    },
    cloneSample(sourceIndex, targetIndex) {
      if (targetIndex < 0 || targetIndex >= this.samples.length) return false
      if (sourceIndex < 0 || sourceIndex >= this.samples.length) return false

      let sourceSample = this.samples[sourceIndex]
      if (sourceSample.PROTEINID < 0) return false

      let baseName = this.samples[sourceIndex].NAME
      let sampleClone = { ...this.samples[targetIndex], ...this.samples[sourceIndex] }
      sampleClone.LOCATION = (targetIndex + 1).toString()
      sampleClone.NAME = this.generateSampleName(baseName, targetIndex+1)
      this.$store.commit('samples/setSample', { index: targetIndex, data: sampleClone })
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
