<template>
  <section class="tw-mx-auto">
    <div class="tw-w-full tw-border tw-border-green-500 tw-m-1 tw-p-2">
      <h1 class="tw-text-xl">Samples to be added</h1>
      <div class="tw-flex">
        <p class="tw-text-lg ">{{sampleIdsList.join(', ')}}</p>
      </div>
    </div>

    <color-scheme @update-color-range-of-samples="updateColorRangeForPlate" class="tw-my-4"/>

    <div v-if="containerComponent && colorSchemeSelected" class="tw-w-full tw-border tw-border-green-500 tw-m-1 tw-p-3 tw-flex tw-flex-col">
      <h1 class="tw-text-xl">Container: {{ selectedContainerName }}</h1>
      <component v-bind:is="containerComponent"
        :container="geometry"
        :samples="samples"
        :scoreThreshold="scoreThreshold"
        :selectedDrops="selectedSamples"
        :colorRange="samplesColorScheme"
        @unselect-cell="deselectCells"
        @cell-clicked="addSelectedCells"/>
    </div>
  </section>
</template>

<script>
import PlateView from './PlateView.vue'
import PuckView from './PuckView.vue'
import Containers from './Containers.vue'
import { difference, uniq } from 'lodash-es'
import ColorScheme from 'app/components/utils/ColorScheme.vue'
import { mapGetters } from 'vuex'

export default {
  name:"Containers",
  components: {
    'plate-view': PlateView,
    'puck-view': PuckView,
    'containers': Containers,
    'color-scheme': ColorScheme
  },
  props: {
    geometry: {
      type: Object
    },
    containerType: {
      type: String,
    },
    selectedContainerName: {
      type: String,
      default: ''
    },
    samples: {
      type: Array,
      default: () => ([])
    }
  },

  computed: {
    ...mapGetters({
      selectedSamples: ['sampleGroups/getSelectedSampleGroups']
    }),
    containerComponent: function() {
      if (this.containerType == 'plate') return 'plate-view'
      if (this.containerType == 'puck') return 'puck-view'
      return null
    },
    sampleIdsList() {
      return this.selectedSamples.map(sample => sample.BLSAMPLEID)
    }
  },
  methods: {
    // Trick to rerender component if container geometry changes
    updatePlateView: function() {
      this.plateKey += 1;
    },
    getFullSamplesDetails(cellsLocation) {
      return cellsLocation.reduce((samples, location) => {
        const sample = this.samples.find(sample => sample.LOCATION === location)
        if (typeof sample !== 'undefined') {
          samples.push(sample)
        }

        return samples

      }, [])
    },
    addSelectedCells: function(cellsLocation) {
      const selectedSamples = uniq(this.selectedSamples.concat(this.getFullSamplesDetails(cellsLocation)))
      this.$store.dispatch('sampleGroups/updateSelectedSampleGroups', selectedSamples)
    },
    deselectCells(cellsLocation) {
      const selectedSamples = difference(this.selectedSamples, this.getFullSamplesDetails(cellsLocation))
      this.$store.dispatch('sampleGroups/updateSelectedSampleGroups', selectedSamples)
    },
    updateColorRangeForPlate({selectedColorRange, threshold }) {
      this.samplesColorScheme = selectedColorRange
      this.scoreThreshold = threshold / 100
      this.colorSchemeSelected = true
    }
  },
  watch: {
    geometry: function(newVal) {},
    containerComponent: function(newVal) {},
  },
  data: function() {
    return {
      sampleGroupName: '',
      plateKey: 0,
      puckKey: 0,
      samplesColorScheme: null,
      colorSchemeSelected: false,
      scoreThreshold: 0,
    }
  }
}
</script>