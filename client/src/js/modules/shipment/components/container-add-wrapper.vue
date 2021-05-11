<template>
    <section>
        <marionette-view
            v-if="ready"
            :key="$route.fullPath"
            :options="options"
            :preloaded="true"
            :mview="mview"
            :breadcrumbs="bc">
        </marionette-view>
    </section>
</template>

<script>
/*
* Abstract the logic to determine what view to render here
* Router guard determines if we can still add content to the proposal
* Then displays the addcontainer view specific to a proposal type
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import { ContainerAddMap } from 'modules/shipment/components/container-map'
import Dewar from 'models/dewar'

import store from 'app/store/store'

export default {
    name: 'container-add-wrapper',
    components: {
        'marionette-view': MarionetteView
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
        }
    },
    created: function() {
        console.log("Container Add Created for proposal Type = " + this.proposalType)

        this.bc = [{ title: 'Shipments', url: '/shipments' }]

        this.model = new Dewar({ DEWARID: this.did })

        this.getDewar().then( (val) => {
            this.mview = ContainerAddMap[this.proposalType] ? ContainerAddMap[this.proposalType].view : ContainerAddMap['default'].view
            // Update the breadcrumbs
            this.bc.push({ title: this.model.get('SHIPPINGNAME'), url: '/shipments/sid/'+this.model.get('SHIPPINGID') })
            this.bc.push({ title: 'Containers' })
            this.bc.push({ title: 'Add Container'})
        }, (error) => {
            console.log("Error getting dewar model " + error.msg)
            app.alert({ title: 'No such dewar', message: error.msg})
        }).finally( () => { this.ready = true }) // Only render when complete
    },
    methods: {
        // We get the model here because the view we render depends on the container details
        getDewar: function() {
            // Wrap the backbone request into a promise so we can wait for the result
            return new Promise((resolve) => {
                this.model.fetch({
                    success: function(model) {
                        console.log("Container Add got model " + JSON.stringify(model))

                        resolve(true)
                    },
                    // Original controller had no error condition...
                    error: function() {
                        reject({msg: 'The specified dewar could not be found'})
                    },
                })

            })
        },
    },
    beforeRouteEnter: (to, from, next) => {
      // Lookup the proposal first to make sure we can still add to it
      store.dispatch('proposal/proposalLookup', { field: 'DEWARID', value: to.params.did })
      .then((response) => {
        console.log("Proposal lookup response: " + JSON.stringify(response))
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