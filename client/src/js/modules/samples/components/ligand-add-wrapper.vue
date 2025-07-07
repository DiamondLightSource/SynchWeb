<template>
  <section>
    <marionette-view
      v-if="ready"
      :key="$route.fullPath"
      :options="options"
      :fetch-on-load="true"
      :mview="mview"
      :breadcrumbs="bc"
    />
  </section>
</template>

<script>
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import AddLigandView from 'modules/samples/views/ligandadd'
import Ligand from 'models/ligand'
// Allow us to map store values to local computed properties
import { mapGetters } from 'vuex'

export default {
    name: 'LigandAddWrapper',
    components: {
        'marionette-view': MarionetteView
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
        ...mapGetters('proposal', {
            proposalType: 'currentProposalType'
        })
    },
    created: function() {
        this.title = 'Ligand'

        this.bc = [{ title: this.title+'s', url: '/'+this.title.toLowerCase()+'s' }]

        // Are we allowed to add?
        if (!this.checkPermissions()) return

        this.bc.push({ title: 'Add '+this.title })

        this.mview = AddLigandView

        // We have no need to wait for proposal lookups here
        this.ready = true
    },
    methods: {
        checkPermissions: function() {
            if (app.proposal && app.proposal.get('ACTIVE') != 1) {
                app.alert({ title: 'Proposal Not Active', message: 'This proposal is not active so new '+this.title+'s cannot be added'} )
                return false
            }
            return true
        },
    }
}
</script>
