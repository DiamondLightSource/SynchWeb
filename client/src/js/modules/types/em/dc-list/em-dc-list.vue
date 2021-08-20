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
            'tableHeaders': [{
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
            }],
            'tableData': [],
        }
    },
    'computed': {
        'heading': function () {
            const heading = 'Data Collections for '
            if (this.model.has('VISIT')) {
                return heading + this.model.get('VISIT') +
                  ' on ' + this.model.get('BEAMLINENAME')
            }
            return heading + this.$store.state.proposal.proposal
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
        this.getCollection()
    },
    'beforeCreate': function() {
        vueXModule.register(this.$store)
    },
    'methods': {
        'pageChanged': function (pagination) {
            this.collection.setPageSize(pagination.pageSize)
            this.collection.getPage(pagination.currentPage)
            this.getCollection()
        },
        'rowClicked': function(dataCollectionModel) {
            // This may be a list for all collections in a proposal
            // without a specific visit number, hence:
            const visit = this.$store.state.proposal.proposal +
                '-' + dataCollectionModel.get('VN')
            this.$router.push(
                '/dc/visit/' + visit +
                '/collection/' + dataCollectionModel.get('ID')
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

<style scoped>
.toolbar {
    display: flex;
    justify-content: space-between;
}
</style>