<template>
  <div class="">
    <div v-if="showPuckSampleTable" class="table">
      <marionette-view
        :key="$route.fullPath"
        :options="options"
        :skipLoad="true"
        :mview="mview">
      </marionette-view>
    </div>
    <div v-else>
      <component
        :is="sampleComponent"
        :samples="samplesCollection"
        :proteins="proteins"
        :sample="model"
      />
    </div>
  </div>
</template>

<script>
import SampleTableView from 'modules/shipment/views/sampletable'
import SingleSample from 'modules/shipment/components/samples/SingleSample.vue'
import SamplePlateEditor from 'modules/shipment/components/samples/SamplePlateEditor.vue'

// Templates we need to pass to the old MX style sample table
import table from 'templates/shipment/sampletablenew.html'
import row from 'templates/shipment/sampletablerownew.html'

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import Sample from 'models/sample'

// new SampleTableView({ proteins: this.proteins, gproteins: this.gproteins, collection: this.samples, childTemplate: row, template: table, auto: this.ui.auto.is(':checked') })
// Use Location as idAttribute for this table
var LocationSample = Sample.extend({
    idAttribute: 'LOCATION',
})

export default {
  name: 'sample-editor',
  components: {
    'marionette-view': MarionetteView,
    'single-sample': SingleSample,
    'sample-plate': SamplePlateEditor
},
  props: {
    sampleComponent: {
      type: String,
    },
    capacity: {
      type: Number,
    },
    selectedSample: {
      type: Number,
    },
    experimentKind: {
      type: Number
    },
    samplesCollection: {
      type: Object
    },
    proteins: {
      type: Object
    },
    gproteins: {
      type: Object
    },
    automated: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    options: function() {
      return {
        proteins: this.proteins,
        gproteins: this.gproteins,
        collection: this.samplesCollection,
        childTemplate: row,
        template: table,
        auto: this.automated,
      }
    },
    showPuckSampleTable: function() {
      console.log("Sample editor ready state changed")
      if (this.sampleComponent == 'Puck') return true
      else return false
    }
  },
  data() {
    return {
      mview: SampleTableView,
      model: new LocationSample()
    }
  },
  watch: {
    sampleComponent: function(newVal) {
      console.log("Sample Editor component has been specified..." + newVal)
    }
  },
  mounted: function() {
    console.log("Sample Editor mounted...")
    console.log("Sample Editor component = " + this.sampleComponent)

  },
  methods: {
    onSelectSample: function(location) {
      this.$emit('select-sample', location)
    },
  },


}
</script>