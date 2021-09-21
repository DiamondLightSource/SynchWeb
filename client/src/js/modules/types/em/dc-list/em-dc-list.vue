<template>
  <section class="content">
    <h1 class="no_mobile">
      {{ heading }}
    </h1>

    <refresh
      v-if="visit !== ''"
      :collection="collection"
      :model="model"
    />

    <div class="toolbar">
      <toolbar />
      <search
        :collection="collection"
        :value="params.search"
        :url="searchUrl"
      />
    </div>

    <relion-dialog />

    <pagination
      class="page_wrap"
      :total-records="collection.state.totalRecords"
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
  </section>
</template>

<script>
import EventBus from 'app/components/utils/event-bus.js'
import Pagination from 'app/components/pagination.vue'
import Refresh from 'modules/types/em/dc-list/refresh.vue'
import RelionDialog from 'modules/types/em/relion/relion-dialog.vue'
import Search from 'modules/types/em/dc-list/search.vue'
import Table from 'app/components/table.vue'
import Toolbar from 'modules/types/em/dc-list/toolbar.vue'
import vueXModule from 'modules/types/em/store'
import { mapGetters } from 'vuex'

export default {
    'name': 'EmDcList',
    'components': {
        'pagination': Pagination,
        'refresh': Refresh,
        'relion-dialog': RelionDialog,
        'search': Search,
        'table-component': Table,
        'toolbar': Toolbar,
    },
    'props': {
        // collections/datacollections.js
        'collection': {
            'type': Object,
            'required': true,
        },
        // Either models/visit.js or models/proposal.js
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
            'tableData': [],
        }
    },
    'computed': {
        ...mapGetters({
            'proposal': 'proposal/currentProposal',
            'visit': 'proposal/currentVisit',
        }),
        'tableHeaders': function() {
            var headers = [{
                'title': 'Data Collection ID',
                'key': 'ID'
            }, {
                'title': 'Archived',
                'key': 'ARCHIVED',
                'format': function(archived) {
                    return archived ? 'Archived': 'Live'
                },
            }, {
                'title': 'Comments',
                'key': 'COMMENTS'
            }, {
                'title': 'Run Status',
                'key': 'RUNSTATUS'
            }, {
                'title': 'File Directory',
                'key': 'DIR'
            }, {
                'title': 'Start Time',
                'key': 'STA'
            }]
            if (this.visit === '') {
                headers.unshift({
                    'title': 'Visit',
                    'key': 'VN',
                })
            }
            return headers
        },
        'heading': function () {
            return 'Data Collections for ' + (
                this.visit === '' ? this.proposal :
                    this.visit +  ' on ' + this.model.get('BEAMLINENAME')
            )
        },
        'searchUrl': function() {
            // In old Marionette version this was
            // !options.noSearchUrl
            // But, as far as I can see, options.noSearchUrl doesn't exist
            return true
        },
    },
    'mounted': function() {
        EventBus.$emit('bcChange', this.breadcrumbs)
        this.$store.commit(
            'proposal/setVisit',
            this.model.has('VISIT') ? this.model.get('VISIT') : false
        );
        /* TODO: this Backbone compatible stuff needs to stay here
           until modules/dc/components/dc-wrapper.vue can be refactored
           and the search and pagination are no longer dependent on a
           Backbone collection */
        this.collection.on('sync', this.collectionFetched)
        this.collection.on('error', this.collectionFailed)
        this.collection.fetch()
    },
    'beforeCreate': function() {
        vueXModule.register(this.$store)
    },
    'beforeDestroy': function() {
        console.log('stopping Collection fetch')
        this.collection.stop()
    },
    'methods': {
        'collectionFetched': function(collection) {
            this.tableData = collection.models
            console.log('Collection fetched', this.tableData)
        },
        'collectionFailed': function() {
            this.$store.commit('notifications/addNotification', {
                'title': 'Error',
                'message': 'Could not retrieve data collections',
                'level': 'error'
            })
        },
        'pageChanged': function (pagination) {
            this.collection.setPageSize(pagination.pageSize)
            this.collection.getPage(pagination.currentPage)
            this.collection.fetch()
        },
        'rowClicked': function(dataCollectionModel) {
            const visit = this.proposal + '-' + dataCollectionModel.get('VN')
            this.$router.push(
                '/dc/visit/' + visit +
                '/collection/' + dataCollectionModel.get('ID')
            )
        },
    },
}
</script>

<style scoped>
.toolbar {
    display: flex;
    justify-content: space-between;
}
</style>