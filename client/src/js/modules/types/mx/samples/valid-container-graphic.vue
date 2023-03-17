<template>
  <section class="tw-mx-auto">
    <div v-if="containerComponent" class="tw-flex">
      <div class="tw-w-full tw-m-1 tw-p-2">
        <div v-if="containerGraphicHeader" class="tw-w-full content">
          <p class="tw-text-xl tw-font-medium">{{ containerGraphicHeader }}</p>
        </div>
        <component
          :key="graphicKey"
          :is="containerComponent"
          :container="geometry"
          :samples="samples"
          :selectedDrops="selectedDrops"
          :selectedSamples="validSamples"
          color-scale="rgb"
          :colorAttribute="colorAttribute"
          :addedColorAttribute="addedColorAttribute"
          :puck-id="containerIdentifier"
          :plate-id="containerIdentifier"
          :label-as-buttons="false"
          v-on="$listeners"
        />
      </div>
    </div>
  </section>
</template>

<script>
import PlateView from 'modules/shipment/components/plate-view.vue'
import PuckView from 'modules/shipment/components/puck-view.vue'
export default {
  name:"valid-container-graphic",
  components: {
    'plate-view': PlateView,
    'puck-view': PuckView,
  },
  props: {
    containerType: {
      type: Object,
      required: true
    },
    samples: {
      type: Array,
      default: []
    },
    validSamples: {
      type: Array,
      default: []
    },
    containerIdentifier: {
      type: String
    },
    containerGraphicHeader: {
      type: String,
      default: 'Container Sample Status'
    },
    colorAttribute: {
      type: String,
      default: 'VALID'
    },
    addedColorAttribute: {
      type: String
    }
  },
  computed: {
    containerComponent: function() {
      if (!this.geometry) return null
      if (this.geometry.columns > 0) return 'plate-view'
      if (this.geometry.capacity > 0) return 'puck-view'
      // We have an unknown type, or incorrect data..
      return null
    },
    geometry: function() {
      let geometry = {}
      geometry.drops = {}
      geometry.capacity = this.containerType.CAPACITY
      geometry.drops.x = this.containerType.DROPPERWELLX
      geometry.drops.y = this.containerType.DROPPERWELLY
      geometry.drops.h = this.containerType.DROPHEIGHT
      geometry.drops.w = this.containerType.DROPWIDTH
      geometry.well = this.containerType.WELLDROP
      geometry.columns = this.containerType.WELLPERROW
      return geometry
    },
    selectedDrops() {
      return this.validSamples.map(sample => Number(sample.LOCATION))
    }
  },
  methods: {
    // Trick to rerender component if container geometry changes
    updateGraphicView: function() {
      this.graphicKey += 1;
    },
  },
  watch: {
    threshold: function() {
      this.updateGraphicView()
    },
    colorScale: function() {
      this.updateGraphicView()
    },
    geometry: function() {
      this.updateGraphicView()
    },
    containerComponent: function() {
      this.updateGraphicView()
    },
    samples: function() {
      this.updateGraphicView()
    },
  },
  data: function() {
    return {
      graphicKey: 0,
    }
  }
}
</script>
