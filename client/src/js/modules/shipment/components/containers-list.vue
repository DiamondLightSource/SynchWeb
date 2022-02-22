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
      @input="setUserContainersState"/>

    <table-panel
      :headers="tableColumns"
      :data="containers"
      v-on="$listeners"
      :actions="tableActions"
    >
      <template v-slot:table-headers="{ headers, sortHeader, actions }">
        <slot name="container-header" :headers="headers" :sortHeader="sortHeader">
          <th
            v-for="(header,index) in headers" :key="index"
            class=""
            @click="sortHeader(header)">
            {{header.title}}
          </th>
          <th v-if="actions">{{actions}}</th>
        </slot>
      </template>
      <template slot-scope="{ data, headers, rowClicked, actions }">
        <slot :data="data" :headers="headers" :rowClicked="rowClicked">
          <tr
            v-for="(row, index) in data"
            :key="index"
            v-on:click="rowClicked(row)">
            <td v-for="(header, index) in headers" :key="index">
              {{row[header.key]}}
            </td>

            <td>
              <slot :row="row" name="container-actions">
                <template slot="actions" v-if="actions"></template>
              </slot>
            </td>
          </tr>
        </slot>
      </template>
    </table-panel>

    <pagination-panel
      :initial-page="containersListState.firstPage"
      :totalRecords="containersListState.totalRecords"
      :pageLinks="10"
      @page-changed="handlePageChange"
    />
  </div>
</template>

<script>
import Table from 'app/components/table.vue'
import Pagination from 'app/components/pagination.vue'
import Containers from 'collections/containers'
import MarionetteApplication from 'app/marionette-application.js'
import CollectionFilters from 'app/components/utils/collection-filters.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'

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
      },
      tableActions() {
          return this.$tableActions
      },
      dewarId() {
        return this.$dewarId()
      },
      restrictLoading() {
        return this.$restrictLoading
      }
    },
    created() {
      this.collection = new Containers(null, {
        queryParams: this.queryParams,
        state: this.pageableCollectionState
      })
      if (this.dewarId) {
        this.collection.dewarID = this.dewarId
      }
    },
    mounted() {
      if (!this.restrictLoading) {
        this.fetchContainers()
      }
    },
    methods: {
      async fetchContainers() {
        this.$store.commit('loading', true)

        const result = await this.$store.dispatch('getCollection', this.collection)
        this.containers = result.toJSON()

        if (this.containers.length > 0) {
          this.$emit('row-clicked', this.containers[0])
        }
        this.containersListState = result.state

        this.$store.commit('loading', false)
      },
      handleFilterSelection(data) {
        if (!this.restrictLoading || (this.restrictLoading && this.dewarId)) {
          this.filters.forEach(filter => {
            if (filter.id === data.id ) {
              filter.isSelected = !data.isSelected
              this.selectedFilterType = filter.isSelected ? filter.id : ''
            } else {
              filter.isSelected = false
            }
          })
        }
      },
      async handlePageChange(data) {
        if (!this.restrictLoading || (this.restrictLoading && this.dewarId)) {
          this.collection.queryParams = { page: data['current-page'], per_page: Number(data['page-size'])}
          await this.fetchContainers()
        }
      },
      setUserContainersState() {
        if (!this.restrictLoading || (this.restrictLoading && this.dewarId)) {
          this.showUserContainers = !this.showUserContainers
        }
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
      },
      dewarId() {
        this.collection.dewarID = this.dewarId
        this.collection.queryParams = { page: 1, per_page: 15 }
        this.fetchContainers()
      }
    },
    inject: [
      '$tableActions',
      '$dewarId',
      '$restrictLoading'
    ]
}
</script>

<style>

</style>
