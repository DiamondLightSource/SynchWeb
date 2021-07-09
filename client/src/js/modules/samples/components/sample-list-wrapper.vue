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
        },
        // Combine with local computed properties, spread operator
        // Allows us to use this.currentProposal mapped to vuex state/getters
        ...mapGetters('proposal', {
            proposalType: 'currentProposalType'
        })
    },
    created: function() {
        console.log("ProteinList View Created for proposal Type = " + this.proposalType)

        let title = SampleListMap[this.proposalType] ? SampleListMap[this.proposalType].title : SampleListMap['default'].title

        this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }]

        this.params = { s: this.search }
        
        this.collection = new Samples(null, { state: { currentPage: this.page || 1 }, queryParams: this.params })

        this.mview = SampleListMap[this.proposalType] ? SampleListMap[this.proposalType].view : SampleListMap['default'].view

        // We have no need to wait for proposal lookups here
        this.ready = true
    },
}
</script>