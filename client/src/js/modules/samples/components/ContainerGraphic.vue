<template>
  <section class="tw-mx-auto">
    <div v-if="containerComponent" class="tw-w-full tw-flex tw-flex-col">
      <h1 class="tw-text-xl">Container: {{ selectedContainerName }}</h1>
      <component v-bind:is="containerComponent"
        :container="geometry"
        :samples="samples"
        :scoreThreshold="scoreThreshold"
        :selectedDrops="selectedSampleLocations"
        sampleColour="gray"
        v-on="$listeners"
        />
    </div>
  </section>
</template>

<script>
import PlateView from './PlateView.vue'
import PuckView from './PuckView.vue'
import Containers from './Containers.vue'

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
    },
    selectedSamples: {
      type: Array,
      default: () => ([])
    }
  },
  computed: {
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