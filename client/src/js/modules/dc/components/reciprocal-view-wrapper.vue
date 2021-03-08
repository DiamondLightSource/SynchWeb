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

import ImageViewer from 'modules/dc/views/reciprocalview'
import DataCollection from 'models/datacollection'


export default {
    name: 'dc-reciprocalview-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'id': Number,
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
            }
        },
        // Combine vuex state with local computed properties
        ...mapGetters('proposal', ['currentProposal', 'currentProposalType'])
    },
    created: function() {
        this.model = new DataCollection({ ID: this.id })

        // Set the marionette view constructor we need based on the type
        this.mview = ImageViewer

        // Lookup proposal from id
        this.setProposal()

        // Fetch the model then set the breadcrumbs
        this.$store.commit('loading', true)

        this.getDataCollection().then( () => {
            // Set breadcrumbs now we have the model
            this.setBreadcrumbs()
        }, (error) => {
            console.log(this.$options.name + " Error getting model " + error.msg)
            app.alert({ title: 'No such data collection', message: error.msg})
        }).finally( () => {
            // Only render when complete
            this.$store.commit('loading', false)
            this.ready = true
        })
    },

    methods: {
        // This method performs a lookup via the store and sets the proposal type based on sample id
        setProposal: function() {
            this.$store.dispatch('proposal/proposalLookup', { field: 'DATACOLLECTIONID', value: this.id } )
                .then((val) => {
                    console.log(this.$options.name + " Proposal Lookup OK - type = " + this.currentProposalType)
                }, (error) => {
                    console.log(this.$options.name + " Error " + error.msg)
                    app.alert({title: 'Error looking up proposal', msg: error.msg})
                })
        },
        getDataCollection: function() {
            // Get the data collection model and set the breadcrumbs
            return new Promise((resolve) => {
                this.model.fetch({
                    success: function(model) {
                        resolve(true)
                    },
                    error: function() {
                        resolve({msg:'The specified data collection doesn\'t exist'})
                    },
                })
            })
        },
        // Breadcrumbs are determined by the model retrieved from backend
        setBreadcrumbs: function() {
            this.bc.push({ title: this.currentProposal+'-'+this.model.get('VN'), url: '/dc/visit/'+this.currentProposal+'-'+this.model.get('VN') })
            this.bc.push({ title: 'Image Viewer' })
            this.bc.push({ title: this.model.get('FILETEMPLATE') })
        }
    },
}
</script>