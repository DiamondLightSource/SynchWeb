<template>
  <section class="tw-mx-auto">
    <div
      v-if="containerComponent"
      class="tw-flex"
    >
      <div class="tw-w-full tw-border-l tw-border-gray-500 tw-m-1 tw-p-2">
        <h1 class="tw-text-xl">
          Container Sample Status
        </h1>
        <p>{{ containerComponent }}</p>
        <component
          :is="containerComponent"
          :key="graphicKey"
          :container="geometry"
          :samples="samples"
          :selected-drops="validSamples"
          color-scale="rgb"
          color-attribute="VALID"
          :label-as-buttons="false"
          @cell-clicked="onCellClicked"
          @drop-clicked="onCellClicked"
        />
      </div>
    </div>
  </section>
</template>

<script>
import PlateView from 'modules/shipment/components/plate-view.vue'
import PuckView from 'modules/shipment/components/puck-view.vue'
export default {
  name:"ValidContainerGraphic",
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
    }
  },
  data: function() {
    return {
      graphicKey: 0,
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
  methods: {
    // Trick to rerender component if container geometry changes
    updateGraphicView: function() {
      this.graphicKey += 1;
    },
    onCellClicked: function(args) {
      this.$emit('cell-clicked', args)
    },
  }
}
</script>
