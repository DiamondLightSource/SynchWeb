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
/*
* This component is probably redundant
* The only proposal types to use this are from within XPDF types
* There is no default view for crystals route defined getsampleview.js
* So we could just map /crystals directly to XPDFSampleList
* For the initial port we are just keeping the structure as is
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import { CrystalListMap } from 'modules/samples/components/samples-map'
import Crystals from 'collections/crystals'
// Allow us to map store values to local computed properties
import { mapGetters } from 'vuex'

export default {
    name: 'CrystalListWrapper',
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
        ...mapGetters('proposal', {
            proposalType: 'currentProposalType'
        })
    },
    created: function() {
        let title = CrystalListMap[this.proposalType] ? CrystalListMap[this.proposalType].title : CrystalListMap['default'].title

        this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }]

        this.params = {s: this.search }
        // Extra search params needed as a special case
        if (this.proposalType == 'xpdf') this.params.seq = 1

        // page will be passed in as prop in Number format
        this.collection = new Crystals(null, { state: { currentPage: this.page || 1, addPrimary: app.type == 'xpdf' }, queryParams: this.params })

        this.mview = CrystalListMap[this.proposalType] ? CrystalListMap[this.proposalType].view : CrystalListMap['default'].view

        // We have no need to wait for proposal lookups here
        this.ready = true
    },
}
</script>