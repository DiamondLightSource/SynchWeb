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
        :collection="collection"
        :model="model"
      />

      <toolbar />

      <div class="breakdown" />
    </div>

    <h1
      v-if="isSingleDataCollection || isDataCollectionGroup"
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

    <status
      v-if="hasCams"
      class="st"
      :beamline="beamline"
    />

    <log
      class="lg"
      :collection="collection"
    />

    <search
      class="srch clearfix"
      :collection="collection"
      :value="searchValue"
      :url="searchUrl"
    />

    <pagination
      class="page_wrap one"
      :collection="collection"
    />

    <div class="data_collections" />

    <pagination
      class="page_wrap two"
      :collection="collection"
    />
  </section>
</template>

<script>
import Log from 'modules/types/em/dc/views/list/log.vue'
import Pagination from 'modules/types/em/dc/views/list/pagination.vue'
import Refresh from 'modules/types/em/dc/views/list/refresh.vue'
import Search from 'modules/types/em/dc/views/list/search.vue'
import Status from 'modules/types/em/dc/views/list/status.vue'
import Toolbar from 'modules/types/em/dc/views/list/toolbar.vue'
import Usage from 'modules/types/em/dc/views/list/usage.vue' // TODO: broken!

export default {
    'name': 'EmDcList',
    'components': {
        'log': Log,
        'pagination': Pagination,
        'refresh': Refresh,
        'search': Search,
        'status': Status,
        'toolbar': Toolbar,
        'usage': Usage,
    },
    'props': {
        'collection': {
            'type': Object,
            'required': true,
        },
        'model': {
            'type': Object,
            'required': true,
        },
        'params': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'beamline': function() {
            return this.model.get('BL')
        }
        'beamlineName': function() {
            return this.model.get('BEAMLINENAME')
        },
        'isVisit': function() {
            return this.$store.state.proposal.visit != ''
        },
        'isSingleDataCollection': function() {
            return this.params.id !== null
        },
        'isDataCollectionGroup': function() {
            return this.params.dcg !== null
        },
        'isProcessingJob': function() {
            return this.params.pjid !== null
        },
        'hasCams': function() {
            return this.model.get('CAMS') == 1
        },
        'searchValue': function() {
            return this.params.search
        },
        'searchUrl': function() {
            // In old Marionette version this was
            // !options.noSearchUrl
            // But, as far as I can see, options.noSearchUrl doesn't exist
            return true
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
