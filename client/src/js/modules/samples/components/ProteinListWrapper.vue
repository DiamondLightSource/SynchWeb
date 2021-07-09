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
// Allow us to map store values to local computed properties
import { mapGetters } from 'vuex'

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
            bc : [],
            title: null,
        }
    },
    computed: {
        options: function() {
            return {
                collection: this.collection,
                model: this.model,
                params: this.params,
                title: this.title
            }
        },
        ...mapGetters('proposal', {
            proposalType: 'currentProposalType'
        })
    },
    created: function() {
        this.title = ProteinListMap[this.proposalType] ? ProteinListMap[this.proposalType].title : ProteinListMap['default'].title

        this.bc = [{ title: this.title+'s', url: '/'+ this.title.toLowerCase()+'s' }]

        this.params = {s: this.search }
        // Extra search params needed as a special case
        if (this.proposalType == 'xpdf') this.params.seq = 1

        // page will be passed in as prop in Number format
        this.collection = new Proteins(null, { state: { currentPage: this.page || 1 }, queryParams: this.params })

        this.mview = ProteinListMap[this.proposalType] ? ProteinListMap[this.proposalType].view : ProteinListMap['default'].view
        // We have no need to wait for proposal lookups here
        this.ready = true
    },
}
</script>