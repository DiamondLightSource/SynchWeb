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
/*
* This component is probably redundant
* The only proposal types to use this are XPDF types
* There is no default view for crystals route defined getsampleview.js
* So we could just map /crystals directly to XPDF...View
* For the initial port we are just keeping the structure as is
*/
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import { CrystalViewMap } from 'modules/samples/components/samples-map'
import Crystal from 'models/crystal'
// Allow us to map store values to local computed properties
import { mapGetters } from 'vuex'

import store from 'app/store/store'

export default {
    name: 'crystal-view-wrapper',
    components: {
        'marionette-view': MarionetteView
    },
    props: {
        'cid': Number,
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
        ...mapGetters('proposal', {
            proposalType: 'currentProposalType'
        })
    },
    created: function() {
        let title = CrystalViewMap[this.proposalType] ? CrystalViewMap[this.proposalType].title : CrystalViewMap['default'].title

        this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }]

        this.model = new Crystal({ CRYSTALID: this.cid }, { addPrimary: this.proposalType == 'xpdf' })
        // For xpdf there is data.seq = 1 used in the fetch request!
        // var data = {}
        // if (app.type == 'xpdf') data.seq = 1
        // sample.fetch({
        //      data: data,
        //      success: function() {
        // For a model we pass the 'data' query parameters in as options.queryParameters
        if (this.proposalType == 'xpdf') this.queryParams = { seq: 1 }

        // Set the marionette view constructor we need based on the type
        this.mview = CrystalViewMap[this.proposalType] ? CrystalViewMap[this.proposalType].view : CrystalViewMap['default'].view

        this.ready = true
    },
    beforeRouteEnter: function(to, from, next) {
        // Lookup the proposal first to make sure its a valid id
        store.dispatch('proposal/proposalLookup',  {field: 'CRYSTALID', value: to.params.cid} )
        .then(() => {
            next()
        }, (error) => {
            store.commit('notifications/addNotification', {title: 'Error looking up proposal from crystal id', msg: error.msg, level: 'error'})
            next('/404')
        })
    }
}
</script>