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

import LigandList from  'modules/samples/views/ligandlist'
import Ligands from 'collections/ligands'
// Allow us to map store values to local computed properties
import { mapGetters } from 'vuex'

export default {
    name: 'LigandListWrapper',
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
        this.title = 'Ligand'

        this.bc = [{ title: this.title+'s', url: '/'+ this.title.toLowerCase()+'s' }]

        this.params = {s: this.search }

        // page will be passed in as prop in Number format
        this.collection = new Ligands(null, { state: { currentPage: this.page || 1 }, queryParams: this.params })

        this.mview = LigandList

        // We have no need to wait for proposal lookups here
        this.ready = true
    },
}
</script>
