<template>
  <div class="content">
      <collection-filters
        class="tw-mb-5"
        :filterData="filterList"
        @toggle-filter-selection="handleFilterSelection"
      ></collection-filters>

    <base-input-checkbox
        :outerClass="
            `tw-mx-1 tw-mb-3 tw-rounded-md tw-w-32
            tw-cursor-pointer tw-p-2 tw-bg-content-filter-background tw-bg-content-filter-background`
        "
        :value="showUserContainers"
        description="My Containers"
        name="currentUserContainers"
        @input="setUserContainersState"
    />

      <table-panel
        :headers="tableColumns"
        :data="containers"
        v-on="$listeners"
      >
        <template slot-scope="{ data, headers }" >
            <slot :data="data" :headers="headers"></slot>
        </template>
      </table-panel>

      <pagination-panel
        :initial-page="containersListState.firstPage"
        :totalRecords="containersListState.totalRecords"
        @page-changed="handlePageChange"
      />
  </div>
</template>

<script>
import Table from 'app/components/utils/table.vue'
import Pagination from 'app/components/utils/pagination.vue'
import Containers from 'collections/containers'
import MarionetteApplication from 'app/marionette-application.js'
import CollectionFilters from 'app/components/utils/collection-filters.vue'
import BaseInputCheckbox from '../../../app/components/inputs/base-input-checkbox.vue'

export default {
    name: 'ContainersList',
    components: {
        'table-panel': Table,
        'pagination-panel': Pagination,
        'collection-filters': CollectionFilters,
        'base-input-checkbox': BaseInputCheckbox
    },
    props: {
        tableHeaders: {
            type: Array,
            default: [
                { key: 'NAME', title: 'Name'},
                { key: 'DEWAR', title: 'Dewar' },
                { key: 'BARCODE', title: 'Barcode' },
                { key: 'SHIPMENT', title: 'Shipment' },
                { key: 'SAMPLES', title: '# Samples' },
                { key: 'SUBSAMPLES', title: '# Subsamples' },
                { key: 'CONTAINERTYPE', title: 'Type' },
                { key: 'CONTAINERSTATUS', title: 'Status' },
                { key: 'LASTQUEUECOMPLETED', title: 'Completed' },
                { key: 'INSPECTIONS', title: 'Inspections' },
                { key: 'LASTINSPECTIONDAYS', title: 'Last (d)' },
                { key: 'AGE', title: 'Age (d)' },
            ]
        },
        showImaging: {
            type: Boolean,
            default: true
        },
        queryParams: {
            type: Object,
            default: () => ({})
        },
        pageableCollectionState: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            collection: new Containers(),
            filters: [
                { id: 'plate', name: 'Plates', isSelected: false },
                { id: 'puck', name: 'Pucks', isSelected: false },
                { id: 'imager', name: 'In Imager', isSelected: false },
                { id: 'queued', name: 'Queued', isSelected: false },
                { id: 'completed', name: 'Completed', isSelected: false },
                { id: 'processing', name: 'Processing', isSelected: false },
                { id: 'subsamples', name: 'Has Subsamples', isSelected: false },
            ],
            showImaging: true,
            // We need access to the marionette app so we can check some user's permission
            marionetteApp: MarionetteApplication.getInstance(),
            extraTableHeaders: [
                { key: 'VISIT', title: 'Visit' },
                { key: 'REQUESTEDIMAGER', title: 'Req. Imager' },
                { key: 'IMAGER', title: 'Imager' }
            ],
            hiddenColumns: [1,2,5,6,9,10,11],
            containers: [],
            containersListState: {},
            selectedFilterType: '',
            showUserContainers: false
        }
    },
    computed: {
        canDisposeContainer() {
            return this.marionetteApp.user_can('disp_cont')
        },
        isMobileApp() {

            return this.marionetteApp.mobile()
        },
        tableColumns() {
            const columnsDisplayed = [...this.tableHeaders]
            const displayExtraColumns = this.canDisposeContainer && !this.isMobileApp && this.showImaging
            return displayExtraColumns ? columnsDisplayed.concat(this.extraTableHeaders) : columnsDisplayed
        },
        filterList() {
            const displayExtraFilter = this.canDisposeContainer && !this.isMobileApp && this.showImaging
            displayExtraFilter ? this.filters.push({ id: 'todispose', name: 'To Dispose'}) : this.filters

            return this.filters
        }
    },
    created() {
        this.collection = new Containers(null, {
            queryParams: this.queryParams,
            state: this.pageableCollectionState
        })
    },
    mounted() {
        this.fetchContainers()
    },
    methods: {
        removeColumnsForMobileView() {
            this.tableColumns
        },
        async fetchContainers() {
            this.$store.commit('loading', true)

            const result = await this.$store.dispatch('getCollection', this.collection)
            this.containers = result.toJSON()
            this.containersListState = result.state

            this.$store.commit('loading', false)
        },
        handleFilterSelection(data) {
            this.filters.forEach(filter => {
                if (filter.id === data.id ) {
                    filter.isSelected = !data.isSelected
                    this.selectedFilterType = filter.isSelected ? filter.id : ''
                } else {
                    filter.isSelected = false
                }
            })
        },
        handlePageChange(data) {
            this.collection.queryParams = { page: data['current-page'], per_page: data['per-page']}
            this.fetchContainers()
        },
        setUserContainersState() {
            this.showUserContainers = !this.showUserContainers
        }
    },
    watch: {
        selectedFilterType() {
            this.collection.queryParams = this.selectedFilterType
                ? { page: 1, per_page: 15, ty: this.selectedFilterType }
                : { page: 1, per_page: 15 }

            this.fetchContainers()
        },
        showUserContainers() {
            this.collection.queryParams = this.showUserContainers
                ? { page: 1, per_page: 15, currentuser: 1 }
                : { page: 1, per_page: 15 }
            
            this.fetchContainers()
        }
    }
}
</script>

<style>

</style>