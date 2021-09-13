<template>
  <section class="tw-mx-auto">
    <div v-if="containerComponent" class="tw-flex">
      <div class="tw-w-full tw-border-l tw-border-gray-500 tw-m-1 tw-p-2">
        <h1 class="tw-text-xl">Container Sample Status</h1>
        <p>{{ containerComponent }}</p>
        <component
          :key="graphicKey"
          :is="containerComponent"
          :container="geometry"
          :samples="samples"
          :selected="selected"
          color-scale="rgb"
          color-attr="VALID"
          @cell-clicked="onCellClicked"/>
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
    selected: {
      type: Array,
      default: []
    },
    samples: {
      type: Array,
      default: []
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
  methods: {
    // Trick to rerender component if container geometry changes
    updateGraphicView: function() {
      this.graphicKey += 1;
    },
    onCellClicked: function(location) {
      this.$emit('cell-clicked', location)
    },
  },
  watch: {
    threshold: function() {
      this.updateGraphicView()
    },
    colorScale: function() {
      this.updateGraphicView()
    },
    geometry: function(newVal) {
      this.updateGraphicView()
    },
    containerComponent: function(newVal) {
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
