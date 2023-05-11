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

import { CrystalAddMap } from 'modules/samples/components/samples-map'
// Allow us to map store values to local computed properties
import { mapGetters } from 'vuex'

export default {
    name: 'CrystalAddWrapper',
    components: {
        'marionette-view': MarionetteView
    },
    data: function() {
        return {
            ready: false,
            mview: null,
            bc : []
        }
    },
    computed: {
        // Don't need to pass any options - it's a plain view
        options: function() {
            return {}
        },
        ...mapGetters('proposal', {
            proposalType: 'currentProposalType'
        })
    },
    created: function() {
        this.mview = CrystalAddMap[this.proposalType] ? CrystalAddMap[this.proposalType].view : CrystalAddMap['default'].view
        let title = CrystalAddMap[this.proposalType] ? CrystalAddMap[this.proposalType].title : CrystalAddMap['default'].title

        this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }, { title: 'Add '+title } ]
        // We have no need to wait for proposal lookups here
        this.ready = true
    },
}
</script>