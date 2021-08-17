<template>
    <section>
        <component
          :is="componentType"
          v-if="ready"
          :key="$route.fullPath"
          :options="options"
          :preloaded="true"
          :fetchOnLoad="true"
          :mview="mview"
          :breadcrumbs="bc"
          :containerModel="model"
          @update-container-state="updateContainerModel"
        />
    </section>
</template>

<script>
/*
* Abstract the logic to determine what view to render here
* This handles plates as well as pucks and deals with xpdf type plates as well
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import SaxsContainerPlateView from 'modules/types/saxs/shipment/views/container-plate-view.vue'
import { ContainerViewMap, ContainerPlateViewMap } from 'modules/shipment/components/container-map'
import Container from 'models/container'
import MxContainerView from 'modules/types/mx/shipment/views/container-plate-view.vue'

import store from 'app/store/store'

export default {
    name: 'container-view-wrapper',
    components: {
        'marionette-view': MarionetteView,
        'saxs-container-plate-view': SaxsContainerPlateView,
        'mx-container-view': MxContainerView
    },
    props: {
        'cid': Number,
        'iid': Number,
        'sid': Number
    },
    data: function() {
        return {
            mview: null,
            model: null,
            collection: null,
            params: null,
            queryParams: null,
            bc : [],
            componentType: 'marionette-view',
            ready: false
        }
    },
    computed: {
        options: function() {
            return {
                collection: this.collection,
                model: this.model,
                params: this.params,
                queryParams: this.queryParams
            }
        },
        proposalType : function() {
            return this.$store.state.proposal.proposalType
        }
    },
    created: function() {
      console.log("Container View Created for proposal Type = " + this.proposalType)

      // Determine the marionette view constructor we need based on the type
      this.bc = [{ title: 'Shipments', url: '/shipments' }]

      // We need to know what the container type is before rendering
      this.model = new Container({ CONTAINERID: this.cid })
      this.getContainer()
    },
    methods: {
      // We get the model here because the view we render depends on the container details
      async getContainer() {
          try {
              const container = await this.$store.dispatch('getModel', this.model)
              const isPlate = this.isPlate(container)

              if (isPlate) {
                this.mview = ContainerPlateViewMap[this.proposalType] ? ContainerPlateViewMap[this.proposalType].view : null
                this.params = { iid: this.iid, sid: this.sid }
              } else {
                this.mview = ContainerViewMap[this.proposalType] ? ContainerViewMap[this.proposalType].view : ContainerViewMap['default'].view
              }

              if (!this.mview) {
                const newViewContainers = {
                  mx: 'mx-container-view',
                  saxs: 'saxs-container-plate-view'
                }

                this.componentType = newViewContainers[this.proposalType]
              }
              // Update the breadcrumbs
              this.bc.push({ title: this.model.get('SHIPMENT'), url: '/shipments/sid/'+this.model.get('SHIPPINGID') })
              this.bc.push({ title: 'Containers' })
              this.bc.push({ title: this.model.get('NAME') })
          } catch (error) {
            console.log("Error getting container model " + error.msg)
            app.alert({ title: 'No such container', message: error.msg})
          } finally {
            this.ready = true
          }
      },
      // Determine if the container is a plate type
      isPlate(model) {
          let containerType = model.get('CONTAINERTYPE')

          // This is the current logic to determine the plate type
          // Anything other than Box, Puck or PCRStrip
          // TODO - get container types from data base
          let is_plate = !(['Box', 'Puck', 'PCRStrip', null].indexOf(containerType) > -1)

          // Also disclude anything with an Xpdf prefix...
          if (is_plate && model.get('CONTAINERTYPE').includes('Xpdf')) is_plate = false

          console.log('is plate', is_plate)

          return is_plate
      },
      async updateContainerModel(data) {
        this.model.set(data)
      }
    },
    beforeRouteEnter: function(to, from, next) {
      // Lookup the proposal first to make sure we can still add to it
      store.dispatch('proposal/proposalLookup', { field: 'CONTAINERID', value: to.params.cid })
      .then(() => {
          console.log("Proposal Lookup OK - type = " + store.state.proposalType)
          next()
      }, (error) => {
          store.commit('notifications/addNotification', {title: 'No such container', msg: error.msg, level: 'error'})
          next('/404')
      })
    }
}
</script>