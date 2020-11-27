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
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import { SampleListMap } from 'modules/samples/components/samples-map'
import Samples from 'collections/samples'


export default {
    name: 'protein-list-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'search': String,
        'page': Number,
    },
    data: function() {
        return {
            ready: false,
            mview: null,
            model: null,
            collection: null,
            params: null,
            bc : []
        }
    },
    computed: {
        options: function() {
            return {
                collection: this.collection,
                model: this.model,
                params: this.params
            }
        }
    },
    created: function() {
        let proposalType = this.$store.state.proposal.proposalType
        console.log("ProteinList View Created for proposal Type = " + proposalType)

        let title = SampleListMap[proposalType].title || 'Sample'

        this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }]

        this.params = { s: this.search }
        
        this.collection = new Samples(null, { state: { currentPage: this.page || 1 }, queryParams: this.params })

        this.mview = SampleListMap[proposalType].view || SampleListMap['default'].title.view

        // We have no need to wait for proposal lookups here
        this.ready = true
    },
}
</script>