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

    <scm-shipment-view v-if="parcels" :model="model"/>

  </div>
</template>

<script>

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import SCMShipmentView from 'modules/shipment/components/SCMShipmentView.vue'
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
    'scm-shipment-view': SCMShipmentView
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

    this.getModel().then( (result) => {
      this.setBreadcrumbs()
      console.log("Got Shipment Model: " + JSON.stringify(result))

      // if (propType == 'mx') this.showDewarView()
      // else this.showParcelsView()
      // this.showDewarView()
      this.showParcelsView()
    })

  },
  methods: {
    showParcelsView: function() {
      console.log("Showing parcels")
      this.parcels = true
      this.ready = false
    },
    showDewarView: function() {
      console.log("Showing dewars")
      this.mview = ShipmentView
      this.ready = true
    },
    // We get the model here because the view we render depends on the container details
    getModel: function() {
        // Wrap the backbone request into a promise so we can wait for the result
        return new Promise((resolve) => {
            this.model.fetch({
                success: function(model) {
                    console.log("Shipment View got model " + JSON.stringify(model))
                    resolve(model)
                },
                // Original controller had no error condition...
                error: function() {
                    reject({msg: 'The specified container could not be found'})
                },
            })

        })
    },
    // Set Breadcrumbs - depends on if visit provided
    setBreadcrumbs: function() {
        this.bc.push({ title: this.model.get('SHIPPINGNAME') })
    },
  }

}
</script>