<template>
  <section class="tw-mx-auto">
    <div class="tw-w-full tw-border tw-border-green-500 tw-m-1 tw-p-2">
      <h1 class="tw-text-xl">Samples to be added</h1>
      <div class="tw-flex">
        <p class="tw-text-lg ">{{sampleIdsList.join(', ')}}</p>
      </div>
    </div>

    <div v-if="containerComponent" class="tw-w-full tw-border tw-border-green-500 tw-m-1 tw-p-3 tw-flex tw-flex-col">
      <h1 class="tw-text-xl">Container: {{ selectedContainerName }}</h1>
      <component v-bind:is="containerComponent"
        :container="geometry"
        :samples="samples"
        :scoreThreshold="scoreThreshold"
        :selectedDrops="selectedSampleLocations"
        sampleColour="green"
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
import { mapGetters } from 'vuex'

export default {
  name:"Containers",
  components: {
    'plate-view': PlateView,
    'puck-view': PuckView,
    'containers': Containers
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
    },
    selectedSampleLocations() {
      return this.selectedSamples.map(sample => Number(sample.LOCATION))
    }
  },
  methods: {
    // Trick to rerender component if container geometry changes
    updatePlateView: function() {
      this.plateKey += 1;
    },
    getFullSamplesDetails(cellsLocation) {
      return cellsLocation.reduce((samples, location) => {
        const sample = this.samples.find(sample => Number(sample.LOCATION) === Number(location))
        if (typeof sample !== 'undefined') {
          samples.push(sample)
        }

        return samples

      }, [])
    },
    addSelectedCells: function(cellsLocation) {
      const selectedSamples = uniq(this.selectedSamples.concat(this.getFullSamplesDetails(cellsLocation)))
      this.$store.commit('sampleGroups/setSelectedSampleGroups', selectedSamples)
    },
    deselectCells(cellsLocation) {
      const selectedSamples = difference(this.selectedSamples, this.getFullSamplesDetails(cellsLocation))
      this.$store.commit('sampleGroups/setSelectedSampleGroups', selectedSamples)
    },
    updateColorRangeForPlate({selectedColorRange, threshold }) {
      this.samplesColorScheme = selectedColorRange
      this.scoreThreshold = threshold / 100
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
      scoreThreshold: 0
    }
  }
}
</script>