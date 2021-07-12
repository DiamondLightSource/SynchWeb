<template>
  <section class="content">
    <h1 class="no_mobile">
      <usage
        v-if="isVisit"
        class="usage r"
      />
      Data Collections
      <span v-if="isVisit">
        for {{ $store.state.proposal.visit }} on {{ beamlineName }}
      </span>
    </h1>

    <div v-if="isVisit && !isSingleDataCollection">
      <refresh
        :collection="options.collection"
        :model="options.model"
      />

      <toolbar />

      <div class="breakdown" />
    </div>

    <h1
      v-if="isSingle || isDataCollectionGroup"
      class="message nou"
    >
      <a
        class="button"
        :href="allCollectionsUrl"
      >View All Data Collections</a>
    </h1>

    <h2 v-if="isDataCollectionGroup">
      Data Collection Group
    </h2>

    <h2 v-if="isProcessingJob">
      Processing Job
    </h2>

    <div class="st" /><!-- status -->
    <div class="lg" /><!-- log -->

    <div class="srch clearfix" /><!-- search -->

    <div class="page_wrap one" />
    <div class="data_collections" />
    <div class="page_wrap two" />
  </section>
</template>

<script>
import Refresh from 'modules/types/em/dc/views/list/refresh.vue'
import Toolbar from 'modules/types/em/dc/views/list/toolbar.vue'
import Usage from 'modules/types/em/dc/views/list/usage.vue' // TODO: broken!

export default {
    'name': 'EmDcList',
    'components': {
        'refresh': Refresh,
        'toolbar': Toolbar,
        'usage': Usage,
    },
    'props': {
        key: String,
        options: {
            type: Object,
            required: true,
        },
        breadcrumbs: Array,
    },
    'computed' : {
        'beamlineName': function() {
            return this.options.model.get('BEAMLINENAME')
        },
        'isVisit': function() {
            return this.$store.state.proposal.visit != ''
        },
        'isSingleDataCollection': function() {
            return !(!this.options.params.id)
        },
        'isDataCollectionGroup': function() {
            return !(!this.options.params.dcg)
        },
        'isProcessingJob': function() {
            return !(!this.options.params.pjid)
        },
        'allCollectionsUrl': function() {
            var url = '/dc'
            if (this.isVisit) {
                url = url + '/visit/' + this.$store.state.proposal.visit
            }
            return url
        },
    },
}
</script>
