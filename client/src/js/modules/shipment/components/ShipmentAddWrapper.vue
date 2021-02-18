<template>
  <div class="content">
    <h1>Add Shipment</h1>
    <p class="tw-text-red-500 tw-mb-2">Default type for this proposal is: {{ proposalType }} </p>

    <div class="tw-flex">
      <div @click="onParcelsSelected" class="tw-w-1/2 tw-h-16 tw-py-4 tw-bg-gray-300 tw-border tw-border-red-800 tw-mx-2">
        <p class="tw-text-2xl tw-text-center"><i class="tw-text-2xl tw-mr-4 fa fa-truck"></i>Saxs / SCM Page</p>
      </div>
      <div @click="onDewarsSelected" class="tw-w-1/2 tw-h-16 tw-py-4 tw-bg-gray-300 tw-border tw-border-red-800 tw-mx-2">
        <p class="tw-text-2xl tw-text-center"><i class="tw-text-2xl tw-mr-4 fa fa-truck"></i>MX Style</p>
      </div>
    </div>

  <marionette-view
    v-if="ready"
    :key="$route.fullPath"
    :options="options"
    :fetchOnLoad="true"
    :mview="mview"
    :breadcrumbs="breadcrumbs">
  </marionette-view>

  <scm-shipment v-if="parcels" />

  </div>
</template>

<script>

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import SCMShipmentForm from 'modules/shipment/components/SCMShipmentForm.vue'
import ShipmentAddView from 'modules/shipment/views/shipmentadd'

export default {
  name: "shipment-add-wrapper",
  props: {
    'breadcrumbs': Array,
    'options': Object
  },
  components: {
    'marionette-view': MarionetteView,
    'scm-shipment': SCMShipmentForm
  },
  data() {
    return {
        ready: false,
        mview: null,
        model: null,
        collection: null,
        params: null,
        queryParams: null,
        parcels: false,
    }
  },
  computed: {
    proposalType: function() {
      return this.$store.state.proposal.proposalType
    }
  },
  created: function() {
    console.log("Shipment Created - " + JSON.stringify(this.breadcrumbs))
  },
  methods: {
    onParcelsSelected: function() {
      console.log("Sending parcels")
      this.parcels = true
      this.ready = false
    },
    onDewarsSelected: function() {
      console.log("Sending dewars")
      this.mview = ShipmentAddView
      this.ready = true
      this.parcels = false
    },
  }

}
</script>