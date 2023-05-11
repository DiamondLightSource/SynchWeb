<template>
  <section>
    <marionette-view
      v-if="ready"
      :key="$route.fullPath"
      :options="options"
      :fetch-on-load="true"
      :mview="mview"
      :breadcrumbs="bc"
      :breadcrumb_tags="bc_tags"
    />
  </section>
</template>

<script>
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import { SampleViewMap } from 'modules/samples/components/samples-map'
import Sample from 'models/sample'
// XPDF Instance extends the sample model
// Could potentially move the Sample or Instance to a lookup in SampleMap
import Instance from 'modules/types/xpdf/models/instance'
import { mapGetters } from 'vuex'

import store from 'app/store/store'

export default {
    name: 'SampleViewWrapper',
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
            params: null,
            queryParams: null,
            bc : [],
            bc_tags: ['NAME']
        }
    },
    computed: {
        options: function() {
            return {
                model: this.model,
                params: this.params,
                queryParams: this.queryParams
            }
        },
        // Combine with local computed properties, spread operator
        // Allows us to use this.currentProposal mapped to vuex state/getters
        ...mapGetters('proposal', {
            proposalType: 'currentProposalType'
        })
    },
    created: function() {
        // Set the marionette view constructor we need based on the type
        this.mview = SampleViewMap[this.proposalType] ? SampleViewMap[this.proposalType].view : SampleViewMap['default'].view

        // As per the original controller this does not use the mapping to determine the title
        // It should probably be consistent and use the following:
        // let title = SampleViewMap[this.proposalType].title || 'Sample'
        // this.bc = [{ title: title+'s', url: '/'+title.toLowerCase()+'s' }]
        // For now stick with the original
        this.bc = [{ title: 'Samples', url: '/samples' }]

        this.model = new (this.proposalType == 'xpdf' ? Instance : Sample)({ BLSAMPLEID: this.sid }, { addPrimary: this.proposalType == 'xpdf'})
        // For xpdf there is data.seq = 1 used in the fetch request!
        // For a model we pass the 'data' query parameters in as options.queryParameters
        if (this.proposalType == 'xpdf') this.queryParams = { seq: 1 }

        this.ready = true
    },
    beforeRouteEnter: function(to, from, next) {
        // Lookup the proposal first to make sure we have a valid id
        store.dispatch('proposal/proposalLookup', {field: 'BLSAMPLEID', value: to.params.sid})
        .then(() => {
            next()
        }, (error) => {
            store.commit('notifications/addNotification', {title: 'Error looking up proposal from sample id', msg: error.msg, level: 'error'})
            next('/404')
        })
    }
}
</script>