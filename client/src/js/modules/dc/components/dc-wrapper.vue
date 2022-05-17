<template>
  <section>
    <marionette-view
      v-if="typeOfView === 'marionette'"
      :key="$route.fullPath"
      :options="options"
      :fetchOnLoad="true"
      :mview="mview"
      :breadcrumbs="bc"
    />
    <!-- For a MarionetteView - collection, model and params are wrapped in the
         options property for pure Vue views they are better as individual
         properties -->
    <em-dc-list
      v-if="typeOfView === 'EmDcList'"
      :collection="collection"
      :model="model"
      :params="params"
      :breadcrumbs="bc"
    />
  </section>
</template>

<script>
// Allow us to map store values to local computed properties
import { mapGetters } from 'vuex'

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import DCList from 'modules/dc/datacollections'
import GenericDCList from 'modules/types/gen/dc/datacollections'
import SMDCList from 'modules/types/sm/dc/datacollections'
import TomoDCList from 'modules/types/tomo/dc/datacollections'
import EmDcList from 'modules/types/em/dc-list/em-dc-list.vue'
import POWDCList from 'modules/types/pow/dc/datacollections'
import SAXSDCList from 'modules/types/saxs/dc/datacollections'
import XPDFDCList from 'modules/types/xpdf/dc/datacollections'
import B18DCList from 'modules/types/b18/dc/datacollections'
import I16DCList from 'modules/types/i16/dc/datacollections'
import I14DCList from 'modules/types/i14/dc/datacollections'
import I18DCList from 'modules/types/i18/dc/datacollections'
import I08DCList from 'modules/types/i08/dc/datacollections'
import I11DCList from 'modules/types/i11/dc/datacollections'
import K11DCList from 'modules/types/k11/dc/datacollections'
import I20DCList from 'modules/types/i20/dc/datacollections'


import DCCol from 'collections/datacollections'
import Proposal from 'models/proposal'
import Visit from 'models/visit'

let dc_views = {
  mx: DCList,
  sm: SMDCList,
  gen: GenericDCList,
  tomo: TomoDCList,
  em: EmDcList,
  pow: POWDCList,
  saxs: SAXSDCList,
  xpdf: XPDFDCList,
  b18: B18DCList,
  i16: I16DCList,
  i14: I14DCList,
  i18: I18DCList,
  i08: I08DCList,
  i11: I11DCList,
  k11: K11DCList,
  i20: I20DCList,
}

export default {
    name: 'dc',
    components: {
        'marionette-view': MarionetteView,
        'em-dc-list': EmDcList,
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
            mview: undefined, // don't use `null` it has `typeof` = `object`
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
        typeOfView: function() {
            // Vue components are objects
            if (typeof this.mview == 'object') {
                return this.mview.name
            }
            // Marionette views are functions (and need the `ready` flag set)
            if (typeof this.mview == 'function' && this.ready) {
                return 'marionette'
            }
            // Anything else, including the default `undefined`
            // Don't use `null` as a default: `typeof null === 'object'`
            return 'not-ready'
        },
        // Combine with local computed properties, spread operator
        // Allows us to use this.currentProposal mapped to vuex state/getters
        ...mapGetters('proposal', ['currentProposal'])
    },
    created: function() {
        // Setup backbone collection and params that will be passed into marionette view
        this.collection = new DCCol(null, {
                        state: { currentPage: this.page ? parseInt(this.page) : 1, pageSize: app.mobile() ? 5 : 15},
                        queryParams: { visit: this.visit, s: this.search, t: this.ty, id: this.id, dcg: this.dcg, PROCESSINGJOBID: this.pjid }
                    })
        this.params = { visit: this.visit, search: this.search, type: this.ty, id: this.id, dcg: this.dcg, pjid: this.pjid }
    },
    mounted: function() {
        this.initialiseView()
    },
    methods: {
        initialiseView: function() {
            // Determine what our model should be...
            // The model is either a visit or proposal used to determine proposalType in the mview
            this.setModel()

            // Start loading animation
            this.$store.commit('loading', true)

            // Fetch the model then set the breadcrumbs
            this.$store.dispatch('getModel', this.model).then( () => {
                if (this.model.has('VISIT')) {
                    this.$store.commit('proposal/setVisit', this.model.get('VISIT'))
                } else {
                    this.$store.commit('proposal/clearVisit')
                }

                // Stop loading animation.
                // Note - not cancelled in finally block but in success/error blocks
                // This avoids premature cancelling of mview loading data collections
                this.$store.commit('loading', false)

                // Set breadcrumbs now we have the model
                this.setBreadcrumbs()

                // Not using lookup to set the proposal type...?
                // This is from original router/controller logic
                let proposalType = this.model.get('TYPE')

                // Determine correct marionette view - defaults to mx
                this.setView(proposalType)
            }, () => {
                // Error getting model
                this.$store.commit('proposal/clearVisit')
                // Again cancel the loading animation here
                this.$store.commit('loading', false)
                console.log(this.$options.name + " Error getting model " + this.error)
                app.alert({ title: 'Error getting model', message: this.error})
            }).finally( () => {
                // Only render when complete
                this.ready = true
            })
        },

        // Set the model to either a visit or proposal
        setModel: function() {
            // We need to fetch a visit or proposal to determine the proposal type
            if (this.visit) {
                app.cookie(this.visit.split('-')[0])
                // Sets the proposal based on visit path parameter
                this.model = new Visit({ VISIT: this.visit })
                this.error = 'The specified visit does not exist'
            } else {
                // Lookup the current proposal data
                this.model = new Proposal({ PROPOSAL: this.currentProposal })
                this.error = 'The specified proposal does not exist'
            }
        },
        // Set Breadcrumbs - depends on if visit provided
        setBreadcrumbs: function() {
            if (this.visit) {
                this.bc.push({ title: this.model.get('BL') })
                this.bc.push({ title: this.visit })
            } else {
                this.bc.push({ title: this.currentProposal })
            }
        },
        // Set marionette view based on a passed proposal type
        setView: function(proposalType) {
            this.mview = dc_views[proposalType] || dc_views['mx']
        },
    },
}
</script>