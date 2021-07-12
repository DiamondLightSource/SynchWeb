<template>
  <section class="content">
    <h1 class="no_mobile">
      <div class="usage r" />
      Data Collections
      <span v-if="isVisit">
        for {{ $store.state.proposal.visit }} on {{ beamlineName }}
      </span>
    </h1>

    <div v-if="isVisit && !isSingle">
      <p
        v-if="isInactive"
        class="message notify"
      >
        This visit is inactive and will not auto update | Auto Refresh
        <input
          type="checkbox"
          name="autorefresh"
          value="1"
        >
        <a
          href="#"
          class="button refresh"
        ><i class="fa fa-refresh" /> Refresh</a>
      </p>

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
import Toolbar from 'modules/types/em/dc/views/list/toolbar.vue'

export default {
    'name': 'EmDcList',
    'components': {
        'toolbar': Toolbar,
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
        'isSingle': function() {
            return !(!this.options.params.id)
        },
        'isDataCollectionGroup': function() {
            return !(!this.options.params.dcg)
        },
        'isProcessingJob': function() {
            return !(!this.options.params.pjid)
        },
        'isInactive': function() {
            return this.visit.match(/^(cm|nt|nr)/) == null &&
                this.options.model.get('ACTIVE') != '1'
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
