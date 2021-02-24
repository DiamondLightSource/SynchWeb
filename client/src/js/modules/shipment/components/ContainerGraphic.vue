<template>
  <section class="tw-mx-auto">
    <div v-if="containerComponent" class="tw-flex">
      <div class="tw-w-full tw-border-l tw-border-gray-500 tw-m-1 tw-p-2">
        <h1 class="tw-text-xl">Container</h1>
        <p>{{containerComponent}}</p>
        <component v-bind:is="containerComponent"
          :container="geometry"
          :samples="samples"
          :selected="selected"
          :threshold="threshold/100"
          :color-scale="colorScale"
          @cell-clicked="onCellClicked"/>
      </div>
    </div>
    <!-- Have removed :selected=selectedItems -->
  </section>
</template>

<script>
import PlateView from './PlateView.vue'
import PuckView from './PuckView.vue'

export default {
  name:"Containers",
  components: {
    'plate-view': PlateView,
    'puck-view': PuckView,
  },
  props: {
    geometry: {
      type: Object
    },
    containerType: {
      type: String,
    },
    samples: {
      type: Array,
      default: []
    },
    colorScale: {
      type: String,
      required: false,
      default: 'rgb'
    },
    selected: {
      type: Array,
      default: []
    },
    key: {
      type: Number
    }
  },

  computed: {
    containerComponent: function() {
      if (!this.containerType) return null
      if (this.containerType.endsWith('plate')) return 'plate-view'
      if (this.containerType.endsWith('puck')) return 'puck-view'
      // If we have an unknown type..
      return null
    },
  },



  created: function() {
    console.log("Container Graphic geometry = " + JSON.stringify(this.geometry))
    console.log("Container Graphic type = " + JSON.stringify(this.containerType))
  },

  methods: {
    // Trick to rerender component if container geometry changes
    updatePlateView: function() {
      this.plateKey += 1;
    },
    onSave: function() {
      alert("Saving Sample Group: " + this.sampleGroupName)
    },
    onCellClicked: function(location) {
        console.log("Cell location clicked event " + JSON.stringify(location))

        let index = this.selectedItems.indexOf(location)

        console.log(JSON.stringify(this.selectedItems))
        console.log("Index for location " + location + " " + index)

        if ( index < 0) {
          console.log("Adding location " + location + " to selected array")
          this.selectedItems.push(+location)
        }
        else this.selectedItems.splice(index, 1)

        this.$emit('cell-clicked', location)
    },
  },
  watch: {
    threshold: function() {
      this.updatePlateView()
    },
    colorScale: function() {
      this.updatePlateView()
     },
     geometry: function(newVal) {
      console.log("New Geometry: " + newVal)
      this.updatePlateView()
    },
     containerComponent: function(newVal) {
      console.log("New Component " + newVal)
      this.updatePlateView()
    },
    samples: function() {
      console.log("Container Graphic detected changes")
      this.updatePlateView()
    },
    key: function() {
      console.log("Container Graphic detected KEY changes")
    }
  },
  data: function() {
    return {
        selectedItems: [],
        sampleGroupName: '',
        plateKey: 0,
        puckKey: 0,
        threshold: 50, // Above number show as green (x10 for range slider)
        colorScale: 'rgb', // 'viridis', rgb', 'threshold'
    }
  }
}
</script>