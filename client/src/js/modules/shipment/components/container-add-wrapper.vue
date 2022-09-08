<template>
    <section>
        <component :is="componentType"
            v-if="ready"
            :key="$route.fullPath"
            :options="options"
            :fetchOnLoad="fetchOnLoad"
            :pre-loaded="true"
            :mview="mview"
            :breadcrumbs="bc"
        />
    </section>
</template>

<script>
/*
* Abstract the logic to determine what view to render here
* Router guard determines if we can still add content to the proposal
* Then displays the addcontainer view specific to a proposal type
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import MxContainerAdd from 'modules/types/mx/shipment/views/mx-container-add.vue'

import { ContainerAddMap } from 'modules/shipment/components/container-map'
import Dewar from 'models/dewar'

import store from 'app/store/store'

export default {
    name: 'container-add-wrapper',
    components: {
        'marionette-view': MarionetteView,
        'mx-container-add': MxContainerAdd
    },
    props: {
        'did': Number,
        'visit': String,
    },
    data: function() {
        return {
            ready: false,
            mview: null,
            model: null,
            collection: null,
            params: null,
            queryParams: null,
            bc : [],
            componentType: 'marionette-view',
        }
    },
    computed: {
        options: function() {
            return {
                dewar: this.model, // Note model mapped to dewar for view
                visit: this.visit
            }
        },
        proposalType : function() {
            return this.$store.state.proposal.proposalType
        },
        fetchOnLoad() {
            const componentTypes = {
              'marionette-view': false,
              'mx-container-add': true
            }

            return componentTypes[this.componentType]
        }
    },
    created: function() {
        this.bc = [{ title: 'Shipments', url: '/shipments' }]

        this.model = new Dewar({ DEWARID: this.did })
        this.getDewar()
    },
    methods: {
        // We get the model here because the view we render depends on the container details
        async getDewar() {
            try {
                const model = await this.$store.dispatch('getModel', this.model)
                this.mview = ContainerAddMap[this.proposalType] ? ContainerAddMap[this.proposalType].view : ContainerAddMap['default'].view
                // USe the legacy components if we have then defined, else use the newer style component
                if (!this.mview) {
                    const newAddContainers = {
                        mx: 'mx-container-add',
                    }

                    this.componentType = newAddContainers[this.proposalType]
                }
    
                // Update the breadcrumbs
                this.bc.push({ title: model.get('SHIPPINGNAME'), url: `/shipments/sid/${model.get('SHIPPINGID')}` })
                this.bc.push({ title: 'Containers' })
                this.bc.push({ title: 'Add Container'})
            } catch (error) {
                console.log("Error getting dewar model " + error.msg)
                app.alert({ title: 'No such dewar', message: error.msg})
            } finally {
                this.ready = true
            }
        },
    },
    beforeRouteEnter: (to, from, next) => {
      // Lookup the proposal first to make sure we can still add to it
      store.dispatch('proposal/proposalLookup', { field: 'DEWARID', value: to.params.did })
      .then((response) => {
          // Make sure we can still add items to this proposal
          if (app.proposal && app.proposal.get('ACTIVE') != 1) {
            store.commit('notifications/addNotification', { title: 'Proposal Not Active', message: 'This proposal is not active so new containers cannot be added'} )
            next('/403?url='+to.fullPath)
          } else {
            next()
          }
      }, (error) => {
          console.log("Error " + error.msg)
          store.commit('notifications/addNotification', {title: 'No such container', msg: error.msg, level: 'error'})
          next('/404')
      })
    }

}
</script>