<template>
  <div class="content">
    <collection-filters
      v-if="displayContainersFilters"
      class="tw-mb-5"
      :filterData="filterList"
      @toggle-filter-selection="handleFilterSelection"
    ></collection-filters>

    <base-input-checkbox
      v-if="displayContainersFilters"
      :outerClass="
        `tw-mx-1 tw-mb-3 tw-rounded-md tw-w-32
        tw-cursor-pointer tw-p-2 tw-bg-content-filter-background tw-bg-content-filter-background`
      "
      :value="showUserContainers"
      description="My Containers"
      name="currentUserContainers"
      @input="setUserContainersState"/>

    <custom-table-component :data-list="containers" table-class="tw-w-full" v-on="$listeners">
      <template v-slot:tableHeaders>
        <td
          :class="column.columnClass"
          v-for="(column, columnIndex) in tableColumns"
          :key="columnIndex"
          @click="$emit('sort-by', column)">{{ column.title}}</td>
        <td :class="actionClass" v-if="tableActions">Actions</td>
      </template>

      <template v-slot:slotData="{ dataList }">
        <custom-table-row
          :class="['tw-w-full', 'tw-cursor-pointer', rowIndex % 2 === 0 ? 'tw-bg-table-body-background-odd': 'tw-bg-table-body-background']"
          v-for="(result, rowIndex) in dataList"
          :key="rowIndex"
          :result="result"
          :row-index="rowIndex"
          @click.native="$emit('row-clicked', result)">
          <td :class="header.columnClass" v-for="(header, index) in tableColumns" :key="index">
            {{ result[header.key] }}
          </td>
          <td :class="actionClass" v-if="tableActions">
            <slot name="containers-table-action" :result="result" :rowIndex="rowIndex"></slot>
          </td>
        </custom-table-row>
      </template>

      <template v-slot:noData>
        <custom-table-row>
          <td class="tw-w-full tw-py-2 tw-text-center" :colspan="tableColumns.length + 1">No containers found</td>
        </custom-table-row>
      </template>
    </custom-table-component>

    <pagination-panel
      :initial-page="containersListState.firstPage"
      :totalRecords="containersListState.totalRecords"
      :pageLinks="10"
      @page-changed="handlePageChange"
    />
  </div>
</template>

<script>
import Pagination from 'app/components/pagination.vue'
import Containers from 'collections/containers'
import MarionetteApplication from 'app/marionette-application.js'
import CollectionFilters from 'app/components/utils/collection-filters.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'

export default {
  name: 'ContainersList',
  components: {
    'custom-table-component': CustomTableComponent,
    'custom-table-row': CustomTableRow,
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
    },
    actionClass: {
      type: String,
    },
    tableActions: {
      type: Boolean
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
    shipmentId() {
      return this.$shipmentId()
    },
    restrictLoading() {
      return this.$restrictLoading
    },
    displayContainersFilters() {
      return this.$displayContainersFilters()
    }
  },
  created() {
    this.collection = new Containers(null, {
      queryParams: this.queryParams,
      state: this.pageableCollectionState
    })
    if (this.shipmentId) {
      this.collection.shipmentID = this.shipmentId
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
      if (!this.restrictLoading || (this.restrictLoading && this.shipmentId)) {
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
      if (!this.restrictLoading || (this.restrictLoading && this.shipmentId)) {
        this.collection.queryParams = { page: data['current-page'], per_page: Number(data['page-size'])}
        await this.fetchContainers()
      }
    },
    setUserContainersState() {
      if (!this.restrictLoading || (this.restrictLoading && this.shipmentId)) {
        this.showUserContainers = !this.showUserContainers
      }
    }
  },
  watch: {
    selectedFilterType() {
      this.collection.queryParams = this.selectedFilterType
        ? { page: 1, per_page: 15, ty: this.selectedFilterType }
        : { page: 1, per_page: 15 }

      this.$emit('unselect-container')
      this.fetchContainers()
    },
    showUserContainers() {
      this.collection.queryParams = this.showUserContainers
        ? { page: 1, per_page: 15, currentuser: 1 }
        : { page: 1, per_page: 15 }

      this.fetchContainers()
    },
    shipmentId() {
      this.collection.shipmentID = this.shipmentId
      this.collection.queryParams = { page: 1, per_page: 15 }
      this.fetchContainers()
    }
  },
  inject: [
    '$shipmentId',
    '$restrictLoading',
    '$displayContainersFilters'
  ]
}
</script>

<style>

</style>
