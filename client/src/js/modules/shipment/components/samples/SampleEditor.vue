<template>
  <div class="table">
    <marionette-view
      v-if="showPuckSampleTable"
      :key="$route.fullPath"
      :options="options"
      :skipLoad="true"
      :mview="mview"/>
    <Plate v-else/>
  </div>
</template>

<script>
import Vue from 'vue'

import SampleTableView from 'modules/shipment/views/sampletable'

import table from 'templates/shipment/sampletablenew.html'
import row from 'templates/shipment/sampletablerownew.html'

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

Vue.component('Plate', {
  name: 'vmxi',
  template: "<p>{{msg}}",
  data() {
    return {
      msg: 'VMXi Single Samples'
    }
  }
})

import Sample from 'models/sample'

// new SampleTableView({ proteins: this.proteins, gproteins: this.gproteins, collection: this.samples, childTemplate: row, template: table, auto: this.ui.auto.is(':checked') })
// Use Location as idAttribute for this table
var LocationSample = Sample.extend({
    idAttribute: 'LOCATION',
})

export default {
  name: 'sample-editor',
  components: {
    'marionette-view': MarionetteView
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
    }
  },
  watch: {
    sampleComponent: function(newVal) {
      console.log("Sample Editor component has been specified...")
      this.resetSamples(this.capacity)
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

    // Reset Backbone Samples Collection
    resetSamples: function(capacity) {
      console.log("Resetting Samples Collection, capacity: " + capacity)
      var samples = Array.from({length: capacity}, (_,i) => new LocationSample({ LOCATION: (i+1).toString(), PROTEINID: -1, CRYSTALID: -1, new: true }))

      this.samplesCollection.reset(samples)

      console.log("Sample editor samples Collection: " + JSON.stringify(this.samplesCollection))
    },
  },


}
</script>