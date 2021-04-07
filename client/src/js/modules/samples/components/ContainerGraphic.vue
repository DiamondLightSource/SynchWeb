<template>
  <section class="tw-mx-auto">
    <div v-if="containerComponent" class="tw-w-full tw-flex tw-flex-col">
      <h1 class="tw-text-xl tw-mb-4">Container: {{ selectedContainerName }}</h1>
      <component v-bind:is="containerComponent"
        :container="containerGeometry"
        :samples="samples"
        :scoreThreshold="scoreThreshold"
        :selectedDrops="selectedSampleLocations"
        sampleColour="#dfdfdf"
        v-on="$listeners"
        />
    </div>
  </section>
</template>

<script>
import PlateView from './PlateView.vue'
import PuckView from './PuckView.vue'
import ContainerTypes from 'modules/shipment/collections/platetypes.js'

export default {
  name:"Containers",
  components: {
    'plate-view': PlateView,
    'puck-view': PuckView
  },
  props: {
    selectedContainerType: {
      type: String,
      default: ''
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
    containerComponent() {
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
  created() {
    this.containerTypes = new ContainerTypes()
  },
  mounted() {
    this.generateContainerGraphicType()
  },
  methods: {
    // Trick to rerender component if container geometry changes
    updatePlateView: function() {
      this.plateKey += 1;
    },
    updateColorRangeForPlate({selectedColorRange, threshold }) {
      this.samplesColorScheme = selectedColorRange
      this.scoreThreshold = threshold / 100
    },
    generateContainerGraphicType() {
      // Returns a backbone model that we need to map to our geometry structure
      let container = this.containerTypes.findWhere({ name: this.selectedContainerType });

      this.containerGeometry.capacity = container.get('capacity');
      this.containerGeometry.columns = container.get('well_per_row');
      this.containerGeometry.drops.x = container.get('drop_per_well_x');
      this.containerGeometry.drops.y = container.get('drop_per_well_y');
      this.containerGeometry.drops.h = container.get('drop_height');
      this.containerGeometry.drops.w = container.get('drop_width');
      this.containerGeometry.well = container.get('well_drop') > 0 ? container.get('well_drop') : null;

      this.containerType = container.get('well_per_row') ? 'plate' : 'puck';
    }
  },
  data: function() {
    return {
      sampleGroupName: '',
      plateKey: 0,
      puckKey: 0,
      samplesColorScheme: null,
      scoreThreshold: 0,
      containerGeometry: {
        capacity: 0,
        columns: 0,
        drops: {
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        well: null,
      },
      containerType: '',
      containerTypes: null
    }
  },
  watch: {
    selectedContainerType() {
      this.generateContainerGraphicType()
    }
  }
}
</script>