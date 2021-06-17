<template>
  <div class="content">
    <marionette-view
      v-if="showMarionetteView"
      :key="$route.fullPath"
      :options="options"
      :fetchOnLoad="true"
      :mview="mview"
      :breadcrumbs="breadcrumbs">
    </marionette-view>

    <component v-else :is="componentView" :model="model"/>

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
        showMarionetteView: false,
        showComponent: false,
        componentView: '',
        mview: null,
        model: null,
        // Initialise breadcrumbs based on the passed props
        bc: this.breadcrumbs,
        // Store array of shipment views based on proposal type
        // At some point we may replace the original shipment marionette view in which case this can be removed
        views: {
          'saxs': 'saxs-shipment-view'
        }
    }
  },
  computed: {
      options: function() {
        return {
            model: this.model,
        }
      },
      proposalType: function() {
        return this.$store.state.proposal.proposalType
      }
  },
  created: function() {
    // What proposal type is this?
    this.model = new ShipmentModel({ SHIPPINGID: this.sid })

    this.$store.dispatch('getModel', this.model).then( () => {
      this.setBreadcrumbs()
      this.setShipmentView()
    }, () => {
      this.$store.commit('notifications/addNotification', {title: 'Error', message: 'Did not get shipment model id: ' + this.sid, level: 'error'})
    })
  },
  methods: {
    setBreadcrumbs: function() {
        this.bc.push({ title: this.model.get('SHIPPINGNAME') })
    },
    setShipmentView: function() {
      // Determine if there is a new vue style component for this proposal type.
      // If not we will show the original Marionette View page
      this.componentView = this.views[this.proposalType] || null

      if (this.componentView) EventBus.$emit('bcChange', this.bc)
      else {
        this.mview = ShipmentView
        this.showMarionetteView = true
      }
    }
  }

}
</script>