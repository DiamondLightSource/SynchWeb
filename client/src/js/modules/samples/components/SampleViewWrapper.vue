<template>
    <section>
        <marionette-view
            v-if="ready"
            :key="$route.fullPath"
            :options="options"
            :fetchOnLoad="true"
            :mview="mview"
            :breadcrumbs="bc"
            :breadcrumb_tags="bc_tags">
        </marionette-view>
    </section>
</template>

<script>
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import { SampleViewMap } from 'modules/samples/components/samples-map'
import Sample from 'models/sample'


export default {
    name: 'sample-view-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'sid': Number,
    },
    data: function() {
        return {
            ready: false,
            mview: null,
            model: null,
            collection: null,
            params: null,
            queryParams: null,
            bc : [],
            bc_tags: ['NAME']
        }
    },
    computed: {
        options: function() {
            return {
                collection: this.collection,
                model: this.model,
                params: this.params,
                queryParams: this.queryParams
            }
        },
        proposalType : function() {
            return this.$store.state.proposal.proposalType
        }
    },
    created: function() {
        // Set the proposal type if different to our current proposal
        this.setProposalType()

        // Set the marionette view constructor we need based on the type
        this.mview = SampleViewMap[this.proposalType].view || SampleView['default'].view

        console.log("Sample View Created for proposal Type = " + this.proposalType)

        // As per the original controller this does not use the mapping to determine the title
        // It should probably be consistent and use the following:
        // let title = SampleViewMap[this.proposalType].title || 'Sample'
        // this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }]
        // For now stick with the original
        this.bc = [{ title: 'Samples', url: '/samples' }]

        this.model = new (this.proposalType == 'xpdf' ? Instance : Sample)({ BLSAMPLEID: this.sid }, { addPrimary: this.proposalType == 'xpdf'})
        // For xpdf there is data.seq = 1 used in the fetch request!
        // var data = {}
        // if (app.type == 'xpdf') data.seq = 1
        // sample.fetch({
        //      data: data,
        //      success: function() {
        // For a model we pass the 'data' query parameters in as options.queryParameters
        if (this.proposalType == 'xpdf') this.queryParams = { seq: 1 }

        this.ready = true
    },
    methods: {
        // This method performs a lookup via the store and sets the proposal type based on sample id
        setProposalType: function() {
            this.$store.dispatch('proposal/proposalLookup', {field: 'BLSAMPLEID', value: this.sid})
                .then((val) => {
                    console.log("Proposal Lookup OK - type = " + this.$store.state.proposalType)
                }, (error) => {
                    console.log("Error " + error.msg)
                    app.alert({title: 'Error looking up proposal', msg: error.msg})
                })
        }
    }
}
</script>