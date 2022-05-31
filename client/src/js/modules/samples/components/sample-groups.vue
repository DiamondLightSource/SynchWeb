<template>
  <div class="content">
    <h1>Sample Group Management</h1>

    <div class="r tw-mb-2">
      <button @click="onAddSampleGroup" class="button">
        <i class="fa fa-plus"></i> Add Sample Group
      </button>
    </div>
    <custom-table-component :data-list="groups" table-class="tw-w-full">
      <template v-slot:tableHeaders>
        <td class="tw-w-6/12 tw-py-2 tw-pl-2">Group Name</td>
        <td class="tw-w-4/12 tw-py-2 tw-pl-2">Number of Samples</td>
        <td class="tw-w-2/12 tw-py-2 tw-text-right tw-pr-2">Actions</td>
      </template>
      <template v-slot:slotData="{ dataList }">
        <custom-table-row
          :class="['tw-w-full', rowIndex % 2 === 0 ? 'tw-bg-table-body-background-odd': 'tw-bg-table-body-background']"
          v-for="(result, rowIndex) in dataList"
          :key="rowIndex"
          :result="result"
          :row-index="rowIndex">
          <template>
            <td class="tw-w-6/12 tw-pl-2 tw-p1-2">{{ result['NAME']}}</td>
            <td class="tw-w-4/12 tw-py-1 tw-pl-2">{{ result['SAMPLEGROUPSAMPLES'] }}</td>
            <td class="tw-w-2/12 tw-py-1 tw-pr-2">
              <span class="tw-flex tw-w-full tw-justify-end">
                <button title="View Sample Groups" @click="selectSampleGroup(result)" class="button"><i class="fa fa-folder-open"></i> </button>
              </span>
            </td>
          </template>
        </custom-table-row>
      </template>
    </custom-table-component>

    <pagination-panel
      :initial-page="sampleGroupsListState.firstPage"
      :totalRecords="sampleGroupsListState.totalRecords"
      :pageLinks="5"
      @page-changed="handlePageChange"
    />

    <div v-if="sampleGroupId" class="content">
      <h1>{{ sampleGroupName || 'Sample Group' }}</h1>
      <div class="tw-flex tw-justify-end">
        <button v-if="sampleGroupId" @click="onEditSampleGroup(sampleGroupId)" class="button">
          <i class="fa fa-plus"></i> Edit Sample Group
        </button>
      </div>

      <div class="tw-w-full tw-flex tw-flex-wrap">
        <div class="tw-w-3/12 tw-p-2" v-for="(samples, containerKey) in sampleGroupContainers" :key="containerKey">
          <valid-container-graphic
            :samples="samples"
            :container-identifier="`container-${containerKey}`"
            :valid-samples="getValidSamplesInContainer(samples)"
            color-attribute="VALID"
            :containerGraphicHeader="`Container: ${generateContainerTitle(cachedContainerList[containerKey])}`"
            :container-type="getContainerTypeForContainer(cachedContainerList[containerKey])"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from 'app/components/pagination.vue'

import SampleGroupsCollection from 'collections/samplegroups.js'
import SampleGroupSamplesCollection from 'collections/samplegroupsamples.js'
import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'
import ValidContainerGraphic from 'modules/types/mx/samples/valid-container-graphic.vue'
import SampleGroupMixin from 'modules/samples/components/sample-group-mixin'

export default {
  name: 'sample-group-management',
  components: {
    'valid-container-graphic': ValidContainerGraphic,
    'custom-table-row': CustomTableRow,
    'custom-table-component': CustomTableComponent,
    'pagination-panel': Pagination,
  },
  mixins: [SampleGroupMixin],
  data: function () {
    return {
      sampleGroups: null, // backbone collection
      sampleGroupSamples: null,
      groups: [],

      sampleGroupMembers: [],
      sampleGroupName: null,
      sampleGroupId: null,
      sampleGroupsListState: {},
      selectedSampleGroup: null,
    };
  },
  created() {
    this.getContainerTypes()
    this.sampleGroups = new SampleGroupsCollection(null, { state: { pageSize: 15 } })
    this.sampleGroups.queryParams.groupSamplesType = 'BLSAMPLEGROUPID'
  },
  mounted() {
    this.getSampleGroups();
  },
  methods: {
    selectSampleGroup(item) {
      this.selectedSampleGroup = item
      this.sampleGroupId = item.BLSAMPLEGROUPID
      this.sampleGroupName = item.NAME
    },
    async onSampleGroupSelected() {
      try {
        this.$store.commit('loading', true)
        this.sampleGroupSamples = new SampleGroupSamplesCollection(null, { state: { pageSize: 9999 }, sampleGroupId: this.sampleGroupId })
  
        const collection = await this.$store.dispatch('getCollection', this.sampleGroupSamples)

        this.sampleGroupByContainers = {}
        this.sampleGroupContainers = {}
        await this.groupSamplesByContainer(collection.toJSON())
      } finally {
        this.$store.commit('loading', false)
      }
    },
    async onEditSampleGroup() {
      await this.$store.commit('sampleGroups/resetSelectedSampleGroups')
      await this.$router.push('/samples/groups/edit/id/' + this.sampleGroupId)
    },
    async onAddSampleGroup() {
      await this.$store.commit('sampleGroups/resetSelectedSampleGroups')
      await this.$router.push({ name: 'samples-group-edit' })
    },
    // Wrap the method to get collection as promise
    async getSampleGroups() {
      try {
        this.$store.commit('loading', true)
  
        const collection = await this.$store.dispatch('getCollection', this.sampleGroups)
  
        this.groups = collection.toJSON()
        this.sampleGroupsListState = collection.state
      } finally {
        this.$store.commit('loading', false)
      }
    },
    async handlePageChange(data) {
      this.sampleGroups.queryParams = { page: data['current-page'], per_page: Number(data['page-size'])}
      await this.getSampleGroups()
    },
    getValidSamplesInContainer(samples) {
      return samples.filter(sample => Number(sample.VALID) === 1)
    }
  },
  watch: {
    selectedSampleGroup() {
      this.onSampleGroupSelected()
    }
  }
}
</script>
