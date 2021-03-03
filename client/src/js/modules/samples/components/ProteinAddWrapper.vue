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
/*
* This component handles both protein add and clone behaviour
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import { ProteinAddMap } from 'modules/samples/components/samples-map'
import Protein from 'models/protein'


export default {
    name: 'protein-add-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'pid': Number
    },
    data: function() {
        return {
            ready: false,
            mview: null,
            model: null,
            bc : [],
            title: '' // Used as a data property so we can report errors ok
        }
    },
    computed: {
        // Don't need to pass any options - it's a plain view
        options: function() {
            return {
                model: this.model
            }
        },
        proposalType: function() {
            return this.$store.state.proposal.proposalType
        }
    },
    created: function() {
        // Make sure we are using an up to date proposalType
        this.setProposalType()

        this.title = ProteinAddMap[this.proposalType].title || 'Protein'

        this.bc = [{ title: this.title+'s', url: '/'+this.title.toLowerCase()+'s' }]

        // Are we allowed to add/clone?
        if (!this.checkPermissions()) return

        // Is this a clone action?
        if (this.pid) {
            // The protein add marionette view can prefill the info from an existing protein
            this.model = new Protein({ PROTEINID: this.pid })

            this.bc.push({ title: 'Clone '+this.title })
        } else {
            this.bc.push({ title: 'Add '+this.title })
        }
        this.mview = ProteinAddMap[this.proposalType].view || ProteinAddMap['default'].view

        // We have no need to wait for proposal lookups here
        this.ready = true
    },
    methods: {
        checkPermissions: function() {
            // If this is a clone operation (denoted by a valid pid) then permissions are ok
            if (this.pid) return true

            // If not we need to check
            if (app.options.get('valid_components') && !app.staff) {
                app.alert({ title: 'Cannot Create '+this.title, message: 'Only staff may create new '+this.title+'s'} )
                return false
            } else if (app.proposal && app.proposal.get('ACTIVE') != 1) {
                app.alert({ title: 'Proposal Not Active', message: 'This proposal is not active so new '+this.title+'s cannot be added'} )
                return false
            }
            return true
        },
        // This method performs a lookup via the store and sets the proposal type based on protein id
        setProposalType: function() {
            // If we have no protein id then we are adding to current proposal and can ignore this step
            if (!this.pid) return

            this.$store.dispatch('proposal/proposalLookup', {field: 'PROTEINID', value: this.pid})
                .then((val) => {
                    console.log("Proposal Lookup OK - type = " + this.$store.state.proposal.proposalType)
                }, (error) => {
                    console.log("Error " + error.msg)
                    app.alert({title: 'Error looking up proposal', msg: error.msg})
                })
        }
    }
}
</script>