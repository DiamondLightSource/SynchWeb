<template>
  <div class="content">
    <h1>Add Shipment</h1>
    <p class="tw-text-red-500 tw-mb-2">Default type for this proposal is: {{ proposalType }} </p>

  <saxs-shipment v-if="scmView" />
  <marionette-view
    v-else
    :key="$route.fullPath"
    :options="options"
    :fetchOnLoad="true"
    :mview="mview"
    :breadcrumbs="breadcrumbs">
  </marionette-view>


  </div>
</template>

<script>
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import SaxsShipmentAdd from 'modules/types/saxs/shipment/views/shipment-add.vue'
import ShipmentAddView from 'modules/shipment/views/shipmentadd'

export default {
  name: "shipment-add-wrapper",
  props: {
    'breadcrumbs': Array,
    'options': Object
  },
  components: {
    'marionette-view': MarionetteView,
    'saxs-shipment': SaxsShipmentAdd
  },
  data() {
    return {
        mview: ShipmentAddView,
    }
  },
  computed: {
    proposalType: function() {
      return this.$store.state.proposal.proposalType
    },
    scmView: function() {
      return this.proposalType == 'saxs' ? true : false
    }
  },
}
</script>