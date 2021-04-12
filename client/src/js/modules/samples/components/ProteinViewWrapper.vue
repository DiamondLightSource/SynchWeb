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

import { ProteinViewMap } from 'modules/samples/components/samples-map'
import Protein from 'models/protein'

export default {
    name: 'protein-view-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'pid': Number,
    },
    data: function() {
        return {
            ready: false,
            mview: null,
            model: null,
            bc : [],
            bc_tags: ['NAME']
        }
    },
    computed: {
        // Only model needed as option to marionette wrapper
        options: function() {
            return {
                model: this.model,
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
        this.mview = ProteinViewMap[this.proposalType].view || ProteinViewMap['default'].view

        let title = ProteinViewMap[this.proposalType].title || 'Protein'

        console.log("Protein View Created for proposal Type = " + this.proposalType)

        this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }]

        this.model = new Protein({ PROTEINID: this.pid })

        this.ready = true
    },
    methods: {
        // This method performs a lookup via the store and sets the proposal type based on sample id
        setProposalType: function() {
            this.$store.dispatch('proposal/proposalLookup', {field: 'PROTEINID', value: this.pid})
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