<template>
  <div class="content">
    <marionette-view
      v-if="ready"
      :key="$route.fullPath"
      :options="options"
      :fetchOnLoad="true"
      :mview="mview"
      :breadcrumbs="breadcrumbs">
    </marionette-view>

    <saxs-shipment-view v-if="parcels" :model="model"/>

  </div>
</template>

<script>
import EventBus from 'app/components/utils/event-bus.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import SaxsShipmentView from 'modules/types/saxs/shipment/views/shipment-view.vue'
import ShipmentView from 'modules/shipment/views/shipment'
import ShipmentModel from 'models/shipment'

export default {
  name: "shipment-view-wrapper",
  props: {
    'breadcrumbs': Array,
    'sid': Number
  },
  components: {
    'marionette-view': MarionetteView,
    'saxs-shipment-view': SaxsShipmentView
  },
  data() {
    return {
        ready: false,
        mview: null,
        model: null,
        parcels: false,
        // Initialise breadcrumbs based on the passed props
        bc: this.breadcrumbs,
    }
  },
  computed: {
      options: function() {
        return {
            model: this.model,
        }
    },
  },
  created: function() {
    console.log("Shipment Created - " + JSON.stringify(this.breadcrumbs))
    // What proposal type is this?
    let propType = this.$store.state.proposal.proposalType

    this.model = new ShipmentModel({ SHIPPINGID: this.sid })

    this.$store.dispatch('getModel', this.model).then( (model) => {
      console.log("Shipment View Wrapper got model " + JSON.stringify(model))
      this.setBreadcrumbs()

      if (propType == 'saxs') {
        EventBus.$emit('bcChange', this.bc)
        this.showSaxsShipmentView()
      } else {
        this.showDewarView()
      }
    })
  },
  methods: {
    showSaxsShipmentView: function() {
      console.log("Showing parcels")
      this.parcels = true
      this.ready = false
    },
    showDewarView: function() {
      console.log("Showing dewars")
      this.mview = ShipmentView
      this.ready = true
    },
    // Set Breadcrumbs - depends on if visit provided
    setBreadcrumbs: function() {
        this.bc.push({ title: this.model.get('SHIPPINGNAME') })
    },
  }

}
</script>