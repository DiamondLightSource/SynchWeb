<template>
    <section>
        <marionette-view 
            v-if="loaded" 
            :key="$route.fullPath" 
            :options="options" 
            :fetchOnLoad="true" 
            :mview="mview" 
            :breadcrumbs="bc">
        </marionette-view>
    </section>
</template>

<script>

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import VisitView from 'modules/stats/views/visit'
import GenericVisitView from 'modules/types/gen/stats/views/visit'
import EMVisitView from 'modules/types/em/stats/views/visit'

import BreakDown from 'modules/stats/models/breakdown'
import Visit from 'models/visit'

let StatsViews = {
  mx: VisitView,
  em: EMVisitView,
  gen: GenericVisitView
}


export default {
    name: 'stats-visit-view',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'visit' : String,
        'from': String,
        'to': String,
    },
    data: function() {
        return {
            loaded: false,
            mview: null,
            model: null,
            params: {
                from: +this.from,
                to: +this.to
            },
            bc : [{ title: 'Visit Statistics', url: '/stats' }, { title: app.prop, url: '/stats' }, { title: this.visit, url : '/dc/visit/'+this.visit }]
        }
    },
    computed: {
        options: function() {
            return {
                model: this.model, // Visit Model
                breakdown: this.breakdown, // Breakdown stats
                params: this.params // from/to parameters
            }
        }
    },
    created: function() {
        console.log("Stats View Created")

        this.fetchData()
    },
    methods: {
        fetchData: function() {
            if (!this.visit) { console.log('Error no visit'); return }
            // The original controller did this:
            // var prop = visit.replace(/-\d+/,'') rather than the more common this.visit.split('-')[0] - don't know why
            // Sets the proposal based on visit path parameter
            app.cookie(this.visit.split('-')[0])

            // Prepare our models for retrieval
            this.model = new Visit({ VISIT: this.visit })
            this.breakdown = new BreakDown({ visit: this.visit })

            const getVisit = this.getVisitType()
            const getBreakdown = this.getBreakdown()
            
            // Wait for both requests to complete.
            // GetBreakdown does not depend on outcome of previous request so we should be able to wait for both
            Promise.all([getVisit, getBreakdown]).then((result) => {
                console.log("Stats View Have determined View Type: " + result)
                this.loaded = true
                if (!result) {
                    console.log("Stats View Error determining proposal type " + error)
                }
            })       
        },

        // Async call to fetch visit info and determine the proposal/visit type
        // This determines what marionette view to render
        getVisitType: function() {
            let self = this

            return new Promise((resolve) => {
                this.model.fetch({
                    success: function() {
                        let proposalType = self.model.get('TYPE')
                        console.log("Stats View got model type " + proposalType)
                        // Should check proposalType is in the array and handle error...
                        if (proposalType in StatsViews) {
                            self.mview = StatsViews[proposalType]
                            resolve(true)
                        } else {
                            // Try generic view in any case
                            self.mview = GenericVisitView
                            resolve(false)
                        }
                    },
                    error: function() {
                        console.log("Stats View error getting view/model type")
                        resolve(false)
                    },
                })
            })
        },
        // Async call to fetch stats breakdown for the visit
        getBreakdown: function() {
            return new Promise((resolve) => {
                this.breakdown.fetch({
                    success: function() {
                        resolve(true)
                    },
                    // Original controller had no error condition...
                    error: function() {
                        console.log("Stats View error getting view/model ")
                        app.message({ title: 'No data', message: 'No data for this visit yet' })
                        resolve(false)
                    },
                })
            })
        },
    },
}
</script>