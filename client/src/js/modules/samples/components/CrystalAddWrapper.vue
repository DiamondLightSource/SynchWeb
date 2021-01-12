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
* This component is probably redundant
* The only proposal types to use this are from within XPDF types
* There is no default view for crystals route defined getsampleview.js
* So we could just map /crystals directly to XPDFSampleList
* For the initial port we are just keeping the structure as is
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import { CrystalAddMap } from 'modules/samples/components/samples-map'
import Crystals from 'collections/crystals'


export default {
    name: 'crystal-add-wrapper',
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
        }
    },
    created: function() {
        let proposalType = this.$store.state.proposal.proposalType
        console.log("CrystalAddWrapper View Created for proposal Type = " + proposalType)

        let title = CrystalAddMap[proposalType].title || 'Crystal'

        this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }, { title: 'Add '+title } ]

        this.mview = CrystalAddMap[proposalType].view || CrystalAddMap['default'].view

        // We have no need to wait for proposal lookups here
        this.ready = true
    },
}
</script>