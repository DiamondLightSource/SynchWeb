<template>
    <section>
        <marionette-view 
            v-if="ready" 
            :key="$route.fullPath" 
            :options="options" 
            :fetchOnLoad="true" 
            :mview="mview" 
            :breadcrumbs="bc">
        </marionette-view>
    </section>
</template>

<script>
// Allow us to map store state values to local computed properties
import { mapState } from 'vuex'

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import DCList from 'modules/dc/datacollections'
import GenericDCList from 'modules/types/gen/dc/datacollections'
import SMDCList from 'modules/types/sm/dc/datacollections'
import TomoDCList from 'modules/types/tomo/dc/datacollections'
import EMDCList from 'modules/types/em/dc/datacollections'
import POWDCList from 'modules/types/pow/dc/datacollections'
import SAXSDCList from 'modules/types/saxs/dc/datacollections'
import XPDFDCList from 'modules/types/xpdf/dc/datacollections'

import DCCol from 'collections/datacollections'
import Proposal from 'models/proposal'
import Visit from 'models/visit'

let dc_views = {
  mx: DCList,
  sm: SMDCList,
  gen: GenericDCList,
  tomo: TomoDCList,
  em: EMDCList,
  pow: POWDCList,
  saxs: SAXSDCList,
  xpdf: XPDFDCList,
}


export default {
    name: 'dc',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'id': Number,
        'visit' : String,
        'page' : Number,
        'search': String,
        'dcg': String,
        'pjid': Number, 
        'ty': String,
    },
    data: function() {
        return {
            ready: false,
            mview: null,
            model: null,
            collection: null,
            params: null,
            bc : [{ title: 'Data Collections', url: '/dc' }],
            error: '', // Used to provide context to proposal lookup
        }
    },
    computed: {
        options: function() {
            return {
                collection: this.collection,
                model: this.model,
                params: this.params
            }
        },
        // Combine with local computed properties, spread operator
        // Allows us to use this.proposal and this.proposalType mapped to vuex state
        // ...mapState(['proposal.proposal', 'proposal.proposalType'])
        proposal: function() {
            return this.$store.getters.currentProposal
        },
        proposalType: function() {
            return this.$store.state.proposal.proposalType
        },
    },
    created: function() {
        console.log("DC View Created")

        this.collection = new DCCol(null, {
                        state: { currentPage: this.page ? parseInt(this.page) : 1, pageSize: app.mobile() ? 5 : 15},
                        queryParams: { visit: this.visit, s: this.search, t: this.type, id: this.id, dcg: this.dcg, PROCESSINGJOBID: this.pjid }
                    })
        this.params = { visit: this.visit, search: this.search, type: this.type, id: this.id, dcg: this.dcg }
    },
    mounted: function() {
        console.log("DC View Mounted")
        this.initialiseView()
    },
    methods: {
        initialiseView: function() {
            // Determine what our model should be...
            this.setModel()

            // Start loading animation
            this.$store.commit('loading', true)

            // Fetch the model then set the breadcrumbs
            this.getModel().then((result) => {
                console.log(this.$options.name + " DC View has determined View Type: " + result)

                // Set breadcrumbs now we have the model
                this.setBreadcrumbs()

                // Not using lookup to set the proposal type...?
                let proposalType = this.model.get('TYPE')
                
                // Determine correct marionette view - defaults to mx
                this.setView(proposalType)
            }, (error) => {
                console.log(this.$options.name + " Error getting model " + error.msg)
                app.alert({ title: 'Error getting model', message: error.msg})
            }).finally( () => { 
                // Only render when complete and stop loading animation
                this.$store.commit('loading', false)
                this.ready = true
            })
        },

        getModel: function() {
            // self so we can use the stored custom error message (as in original controller)
            let self = this

            return new Promise((resolve) => {
                this.model.fetch({
                    success: function(model) {
                        resolve(true)
                    },
                    error: function() {
                        console.log(self.$options.name + " DC Wrapper error getting model ")
                        resolve({msg: self.error})
                    },
                })   

            })
        },
        // Set the model to either a visit or proposal 
        setModel: function() {
            // We need to fetch a visit or proposal to determine the proposal type
            if (this.visit) {
                app.cookie(this.visit.split('-')[0])
                console.log(this.$options.name + " DC SetModel VISIT")
                // Sets the proposal based on visit path parameter
                this.model = new Visit({ VISIT: this.visit })
                this.error = 'The specified visit does not exist'
            } else {
                console.log(this.$options.name + " DC SetModel WAS NOT PASSED VISIT")
                // Lookup the current proposal data
                this.model = new Proposal({ PROPOSAL: this.proposal })
                this.error = 'The specified proposal does not exist'
            }
        },
        // Set Breadcrumbs - depends on if visit provided
        setBreadcrumbs: function() {
            if (this.visit) {
                this.bc.push({ title: this.model.get('BL') })
                this.bc.push({ title: this.visit })
            } else {
                this.bc.push({ title: this.proposal })
            }
        },
        // Set marionette view based on a passed proposal type
        setView: function(proposalType) {
            this.mview = dc_views[proposalType] || dc_views['mx']
        },
    },
}
</script>