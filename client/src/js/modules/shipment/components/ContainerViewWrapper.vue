<template>
    <section>
        <marionette-view
            v-if="mViewReady"
            :key="$route.fullPath"
            :options="options"
            :fetchOnLoad="true"
            :mview="mview"
            :breadcrumbs="bc">
        </marionette-view>
        <scm-container-plate-view
          v-if="!mViewReady && useScmView"
          :containerModel="model">
        </scm-container-plate-view>
    </section>
</template>

<script>
/*
* Abstract the logic to determine what view to render here
* This handles plates as well as pucks and deals with xpdf type plates as well
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import ScmContainerView from 'modules/shipment/components/SCMContainerPlateView.vue'
import { ContainerViewMap, ContainerPlateViewMap } from 'modules/shipment/components/container-map'
import Container from 'models/container'

import store from 'app/store/store'

export default {
    name: 'container-view-wrapper',
    components: {
        'marionette-view': MarionetteView,
        'scm-container-plate-view': ScmContainerView
    },
    props: {
        'cid': Number,
        'iid': Number,
        'sid': Number
    },
    data: function() {
        return {
            mViewReady: false,
            mview: null,
            model: null,
            collection: null,
            params: null,
            queryParams: null,
            bc : [],
            useScmView: false,
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
        // Set the proposal type if different to our current proposal
        // this.setProposalType()
        console.log("Container View Created for proposal Type = " + this.proposalType)

        // Determine the marionette view constructor we need based on the type
        this.bc = [{ title: 'Shipments', url: '/shipments' }]

        // We need to know what the container type is before rendering
        this.model = new Container({ CONTAINERID: this.cid })

        this.getContainer().then( (isPlate) => {
            console.log("Container model is plate: " + isPlate)
            if (isPlate) {
                this.mview = ContainerPlateViewMap[this.proposalType] ? ContainerPlateViewMap[this.proposalType].view : null
                this.params = { iid: this.iid, sid: this.sid }
            } else {
                this.mview = ContainerViewMap[this.proposalType] ? ContainerViewMap[this.proposalType].view : ContainerViewMap['default'].view
            }
            // Update the breadcrumbs
            this.bc.push({ title: this.model.get('SHIPMENT'), url: '/shipments/sid/'+this.model.get('SHIPPINGID') })
            this.bc.push({ title: 'Containers' })
            this.bc.push({ title: this.model.get('NAME') })
        }, (error) => {
            console.log("Error getting container model " + error.msg)
            app.alert({ title: 'No such container', message: error.msg})
        }).finally( () => {
          // Only render marionette view if we have one
          if (this.mview != null) this.mViewReady = true
          else this.useScmView = true
          // If no mview, we use the new SCM general view
        })
    },
    methods: {
        // This method performs a lookup via the store and sets the proposal type based on sample id
        setProposalType: function() {
            this.$store.dispatch('proposal_lookup', {field: 'CONTAINERID', value: this.cid})
                .then((val) => {
                    console.log("Proposal Lookup OK - type = " + this.$store.state.proposal.proposalType)
                }, (error) => {
                    console.log("Error " + error.msg)
                    app.alert({title: 'Error looking up proposal', msg: error.msg})
                })
        },
        // We get the model here because the view we render depends on the container details
        getContainer: function() {
            let self = this

            // Wrap the backbone request into a promise so we can wait for the result
            return new Promise((resolve) => {
                this.model.fetch({
                    success: function(model) {
                        console.log("Container View got model " + JSON.stringify(model))
                        let isPlate = self.isPlate(model)

                        resolve(isPlate)
                    },
                    // Original controller had no error condition...
                    error: function() {
                        reject({msg: 'The specified container could not be found'})
                    },
                })

            })
        },
        // Determine if the container is a plate type
        isPlate: function(model) {
            let containerType = model.get('CONTAINERTYPE')

            // This is the current logic to determine the plate type
            // Anything other than Box, Puck or PCRStrip
            // TODO - get container types from data base
            let is_plate = !(['Box', 'Puck', 'PCRStrip', null].indexOf(containerType) > -1)

            // Also disclude anything with an Xpdf prefix...
            if (is_plate && model.get('CONTAINERTYPE').includes('Xpdf')) is_plate = false

            console.log('is plate', is_plate)

            return is_plate
        }
    },
    beforeRouteEnter: function(to, from, next) {
      // Lookup the proposal first to make sure we can still add to it
      store.dispatch('proposal_lookup', { field: 'CONTAINERID', value: to.params.cid })
      .then((response) => {
          console.log("Proposal Lookup OK - type = " + store.state.proposalType)
          next()
      }, (error) => {
          console.log("Error " + error.msg)
          app.alert({title: 'No such container', msg: error.msg})
          next('/404')
      })
    }
}
</script>