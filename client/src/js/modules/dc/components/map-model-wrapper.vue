<!-- Map Model Viewer - Wrapper component -->
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
import { mapGetters } from 'vuex'

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import MapModelViewer from 'modules/dc/views/mapmodelview'
import DataCollection from 'models/datacollection'


export default {
    name: 'dc-mapmodelview-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'id': Number,
        'ty': String,
        'dt': String,
        'ppl': String,
    },
    data: function() {
        return {
            ready: false,
            mview: null,
            model: null,
            bc : [{ title: 'Data Collections', url: '/dc' }]
        }
    },
    computed: {
        // Options that will be passed into the marionette view
        options: function() {
            return {
                model: this.model,
                ty: this.ty,
                dt: this.dt,
                ppl: this.ppl,
            }
        },
        // Combine vuex state with local computed properties
        ...mapGetters('proposal', ['currentProposal', 'currentProposalType'])
    },
    created: function() {
        this.model = new DataCollection({ ID: this.id })

        // Set the marionette view constructor we need based on the type
        this.mview = MapModelViewer

        // Lookup proposal from id
        this.setProposal()

        // Fetch the model then set the breadcrumbs
        this.$store.commit('loading', true)

        this.$store.dispatch('getModel', this.model).then( () => {
            // Set breadcrumbs now we have the model
            this.setBreadcrumbs()
        }, () => {
            console.log(this.$options.name + ' Error getting model, the specified data collection doesn\'t exist')
            app.alert({ title: 'No such data collection', message: 'The specified data collection doesn\'t exist'})
        }).finally( () => {
            // Only render when complete
            this.$store.commit('loading', false)
            this.ready = true
        })
    },
    methods: {
        // This method performs a lookup via the store and sets the proposal type based on id
        setProposal: function() {
            this.$store.dispatch('proposal/proposalLookup', { field: 'DATACOLLECTIONID', value: this.id } )
                .then((val) => {
                    console.log(this.$options.name + " Proposal Lookup OK - type = " + this.currentProposalType)
                }, (error) => {
                    console.log(this.$options.name + " Error " + error.msg)
                    app.alert({title: 'Error looking up proposal', msg: error.msg})
                })
        },
        // Breadcrumbs are determined by the model retrieved from backend
        setBreadcrumbs: function() {
            this.bc.push({ title: this.currentProposal+'-'+this.model.get('VN'), url: '/dc/visit/'+this.currentProposal+'-'+this.model.get('VN') })
            this.bc.push({ title: 'Map/Model Viewer' })
            this.bc.push({ title: this.model.get('FILETEMPLATE') })
        }
    },
}
</script>