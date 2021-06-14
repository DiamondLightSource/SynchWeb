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

import { ProteinListMap } from 'modules/samples/components/samples-map'
import Proteins from 'collections/proteins'

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

        let title = ProteinListMap[proposalType].title || 'Protein'

        this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }]

        this.params = {s: this.search }
        // Extra search params needed as a special case
        if (proposalType == 'xpdf') {
            this.params.seq = 1
            this.params.external = 1
            this.params.original = 1
        }

        // page will be passed in as prop in Number format
        this.collection = new Proteins(null, { state: { currentPage: this.page || 1 }, queryParams: this.params })

        this.mview = ProteinListMap[proposalType].view || ProteinListMap['default'].view

        // We have no need to wait for proposal lookups here
        this.ready = true
    },
}
</script>