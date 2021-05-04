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
// Allow us to map store state values to local computed properties
import { mapGetters } from 'vuex'

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import ImageViewer from 'modules/dc/views/imageviewer'
import DataCollection from 'models/datacollection'

import store from 'app/store/store'

export default {
    name: 'dc-imageviewer-wrapper',
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
        // Breadcrumbs are determined by the model retrieved from backend
        setBreadcrumbs: function() {
            this.bc.push({ title: this.currentProposal+'-'+this.model.get('VN'), url: '/dc/visit/'+this.currentProposal+'-'+this.model.get('VN') })
            this.bc.push({ title: 'Image Viewer' })
            this.bc.push({ title: this.model.get('FILETEMPLATE') })
        }
    },
    beforeRouteEnter: function(to, from, next) {
        // Lookup the proposal first to make sure its a valid id
        store.dispatch('proposal/proposalLookup',  { field: 'DATACOLLECTIONID', value: to.params.id } )
        .then(() => {
            next()
        }, (error) => {
            store.commit('notifications/addNotification', {title: 'Error looking up proposal from datacollection id', msg: error.msg, level: 'error'})
            next('/404')
        })
    }
}
</script>