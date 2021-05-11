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

// Expect we will need to expand this into different proposal types via a map in future...
import PlanView from 'modules/types/xpdf/views/plan'
import Container from 'models/container'

import store from 'app/store/store'

export default {
    name: 'container-plan-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'cid': Number,
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
                model: this.model,
            }
        },
        proposalType : function() {
            return this.$store.state.proposal.proposalType
        }
    },
    created: function() {
        console.log("Container Plan Created for proposal Type = " + this.proposalType)

        this.bc = [{ title: 'Shipments', url: '/shipments' }]

        this.model = new Container({ CONTAINERID: this.cid })

        this.getContainer().then( (val) => {
            this.mview = PlanView
            // Update the breadcrumbs
            this.bc.push({ title: this.model.get('SHIPMENT'), url: '/shipments/sid/'+this.model.get('SHIPPINGID') })
            this.bc.push({ title: 'Containers' })
            this.bc.push({ title: this.model.get('NAME') })
            this.bc.push({ title: 'Plan Experiment' })

        }, (error) => {
            console.log("Error getting model " + error.msg)
            app.alert({ title: 'No such container', message: error.msg})
        }).finally( () => { this.ready = true }) // Only render when complete
    },
    methods: {
        // We get the model here because we are just wrapping the marionette view
        getContainer: function() {
            // Wrap the backbone request into a promise so we can wait for the result
            return new Promise((resolve) => {
                this.model.fetch({
                    success: function(model) {
                        console.log("Container Plan got model " + JSON.stringify(model))

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
      store.dispatch('proposal/proposalLookup', { field: 'CONTAINERID', value: to.params.cid })
      .then((response) => {
          console.log("Proposal lookup response: " + JSON.stringify(response))
          next()
      }, (error) => {
          store.commit('notifications/addNotification', {title: 'No such container', msg: error.msg, level: 'error'})
          next('/404')
      })
    }

}
</script>