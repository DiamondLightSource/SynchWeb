<template>
  <section class="content">
    <h1 class="no_mobile">
      {{ heading }}
    </h1>

    <refresh
      v-if="$store.state.proposal.visit != ''"
      :collection="collection"
      :model="model"
    />

    <toolbar />

    <search
      class="srch clearfix"
      :collection="collection"
      :value="searchValue"
      :url="searchUrl"
    />

    <pagination
      class="page_wrap"
      :total-records="dataCollectionsLength"
      :initial-page="1"
      :page-links="3"
      @page-changed="pageChanged"
    />

    <div class="data_collections">
      <table-component
        :headers="tableHeaders"
        :data="tableData"
        @row-clicked="rowClicked"
      />
    </div>

    <!-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -->
    <!--                                                                                  -->
    <!-- TODO: Mirror two pagination controls                                             -->
    <!-- https://bootstrap-vue.org/docs/components/pagination#goto-firstlast-button-type  -->
    <!--                                                                                  -->
    <!-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -->
  </section>
</template>

<script>
import EventBus from 'app/components/utils/event-bus.js'
import Pagination from 'app/components/pagination.vue'
import Refresh from 'modules/types/em/dc-list/refresh.vue'
import Search from 'modules/types/em/dc-list/search.vue'
import Table from 'app/components/table.vue'
import Toolbar from 'modules/types/em/dc-list/toolbar.vue'

export default {
    'name': 'EmDcList',
    'components': {
        'pagination': Pagination,
        'refresh': Refresh,
        'search': Search,
        'toolbar': Toolbar,
        'table-component': Table,
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
        'breadcrumbs': {
            'type': Array,
            'required': true,
        },
    },
    'data': function() {
        return {
            'tableHeaders': [
                { 'title': 'Data Collection ID', 'key': 'ID'},
                { 'title': 'Archived', 'key': 'ARCHIVED', 'format': this.archivedFormat},
                { 'title': 'Comments', 'key': 'COMMENTS'},
                { 'title': 'Run Status', 'key': 'RUNSTATUS'},
                { 'title': 'File Directory', 'key': 'DIR'},
                { 'title': 'Start Time', 'key': 'STA'},
            ],
            'tableData': [],
        }
    },
    'computed': {
        'heading': function () {
            const heading = 'Data Collections for '
            const visit = this.$store.state.proposal.visit
            if (visit == '') {
                return heading + this.$store.state.proposal.proposal
            }
            return heading + visit + ' on ' + this.model.get('BEAMLINENAME')
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
        'dataCollectionsLength': function () {
            return this.collection.state.totalRecords
        },
    },
    'mounted': function() {
        EventBus.$emit('bcChange', this.breadcrumbs)
        this.getCollection()
    },
    'methods': {
        'archivedFormat': function(archived) {
            return archived ? 'Archived': 'Live'
        },
        'pageChanged': function (pagination) {
            this.collection.setPageSize(pagination.pageSize)
            this.collection.getPage(pagination.currentPage)
            this.getCollection()
        },
        'rowClicked': function(model) {
            this.$router.push(
                '/dc/visit/' + this.$store.state.proposal.visit +
                '/collection/' + model.get('ID')
            )
        },
        'getCollection': function() {
            this.$store.dispatch('getCollection', this.collection).then(
                (collection) => {
                    this.tableData = collection.models
                },
                () => {
                    this.$store.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Could not retrieve data collections',
                        'level': 'error'
                    })
                }
            )
        },
    },
}
</script>
