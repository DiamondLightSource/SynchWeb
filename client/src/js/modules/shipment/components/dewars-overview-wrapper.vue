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
* Abstract the logic to handle the exceptional case
* This model requires setting a sorting method which no other view needs
* Rather than make this an option and make MarionetteViewWrapper more complex, we'll handle it here
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

// Expect we will need to expand this into different proposal types via a map in future...
import DewarOverview from 'modules/shipment/views/dewaroverview'
import Dewars from 'collections/dewars'

import store from 'app/store/store'

export default {
    name: 'dewar-overview-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'page': Number,
        'search': String,
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
        // Options passed into the marionette view on construction
        options: function() {
            return {
                collection: this.collection,
                params: { s: this.search } 
            }
        },
        proposalType : function() {
            return this.$store.state.proposal.proposalType
        }
    },
    created: function() {
        console.log("Dewar Overview Created")

        this.bc = [{ title: 'Shipments', url: '/shipments' }]
        this.bc.push( { title: 'Dewar Overview' } )

        this.collection = new Dewars(null, { 
            state: { currentPage: this.page},
            queryParams: { s: this.search, all: 1, ty: this.proposalType } 
        })
        this.collection.setSorting('FIRSTEXPERIMENTST', 1)

        this.getDewars().then( (val) => {
            this.mview = DewarOverview
        }, (error) => {
            console.log("Error getting collection " + error.msg)
            app.message({ title: 'No dewars', message: error.msg})
        }).finally( () => { this.ready = true }) // Only render when complete
    },
    methods: {
        // We get the collection here because we are just wrapping the marionette view
        getDewars: function() {
            // Wrap the backbone request into a promise so we can wait for the result
            return new Promise((resolve) => {
                this.collection.fetch({
                    success: function(response) {
                        console.log("Dewar Overview got dewars: " + JSON.stringify(response))
                        resolve(true)
                    },
                    error: function() {
                        reject({msg: 'Couldn\'t fetch dewar list'})
                    },
                })   

            })
        },
    },
}
</script>