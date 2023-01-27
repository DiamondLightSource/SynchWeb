<template>
  <div class="content">
    <h1>Sample Group Management</h1>

    <div class="r tw-mb-2">
      <button @click="onAddSampleGroup" class="button tw-text-lg">
        <i class="fa fa-plus"></i> Create Sample Group
      </button>
    </div>
    <custom-table-component :data-list="groups" table-class="tw-w-full">
      <template v-slot:tableHeaders>
        <td class="tw-w-3/12 tw-py-2 tw-pl-2">Group Name</td>
        <td class="tw-w-4/12 tw-py-2 tw-pl-2">Container Barcodes</td>
        <td class="tw-w-3/12 tw-py-2 tw-pl-2">Number of Samples</td>
        <td class="tw-w-2/12 tw-py-2 tw-text-right tw-pr-2">Actions</td>
      </template>
      <template v-slot:slotData="{ dataList }">
        <custom-table-row
          @click.native="selectSampleGroup(result)"
          :class="['tw-w-full', 'tw-cursor-pointer', rowIndex % 2 === 0 ? 'tw-bg-table-body-background-odd': 'tw-bg-table-body-background']"
          v-for="(result, rowIndex) in dataList"
          :key="rowIndex"
          :result="result"
          :row-index="rowIndex">
          <template>
            <td class="tw-w-3/12 tw-pl-2 tw-p1-2">{{ result['NAME']}}</td>
            <td class="tw-w-4/12 tw-pl-2 tw-p1-2">{{ result['CONTAINERS']}}</td>
            <td class="tw-w-3/12 tw-py-1 tw-pl-2">{{ result['SAMPLEGROUPSAMPLES'] }}</td>
            <td class="tw-w-2/12 tw-py-1 tw-pr-2">
              <span class="tw-flex tw-w-full tw-justify-end">
                <button title="View Sample Group" @click="selectSampleGroup(result)" class="button"><i class="fa fa-folder-open"></i> </button>
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
        <button v-if="sampleGroupId" @click="onEditSampleGroup(sampleGroupId)" class="button tw-text-lg">
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

      <div class="processing-job-list tw-mt-5">
        <div class="content">
          <h1> Summary of last multiplex jobs from group {{ sampleGroupName }}</h1>
          <div class="tw-flex tw-justify-end" v-if="loadedMultiplex && Object.keys(latestMultiplexJobs).length > 0">
            <button class="button tw-text-link-color" @click="goToSampleGroupsDataCollections">Sample Group Data Collections</button>
          </div>
        </div>

        <auto-processing-jobs-list
          v-if="Object.keys(latestMultiplexJobs).length > 0 && loadedMultiplex"
          :processing-programs-list="latestMultiplexJobs" />

        <div v-else-if="Object.keys(latestMultiplexJobs).length < 1 && loadedMultiplex" class="tw-w-full">
          <p class="tw-text-center">No multiplex job for this sample group at this time.</p>
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
import AutoProcessingJobsList from 'modules/dc/components/auto-processing-jobs-list.vue'

export default {
  name: 'sample-group-management',
  components: {
    'auto-processing-jobs-list': AutoProcessingJobsList,
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
      latestMultiplexJobs: [],
      loadedMultiplex: false
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
    async selectSampleGroup(item) {
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
        await this.fetchLatestSampleGroupMultiplexJobs()
      } finally {
        this.$store.commit('loading', false)
      }
    },
    async onEditSampleGroup() {
      await this.$store.commit('sampleGroups/resetSelectedSampleGroups')
      await this.$router.push('/samples/groups/edit/' + this.sampleGroupId)
    },
    async onAddSampleGroup() {
      await this.$store.commit('sampleGroups/resetSelectedSampleGroups')
      await this.$router.push({ name: 'samples-group-create' })
    },
    // Wrap the method to get collection as promise
    async getSampleGroups() {
      try {
        this.$store.commit('loading', true)
  
        const collection = await this.$store.dispatch('getCollection', this.sampleGroups)
  
        const result = collection.toJSON()
        const uniqueContainer = {}

        this.groups = result.map(group => {
          const containerList = group['CONTAINERIDS'].split(',')
          containerList.forEach(container => {
            uniqueContainer[container] = container
          })

          return {
            ...group,
            CONTAINERIDS: containerList,
            CONTAINERS: group['CONTAINERS'].replace(/,/g, ', ')
          }
        })

        this.sampleGroupsListState = collection.state
        await this.fetchContainersInformation(uniqueContainer)
      } finally {
        this.$store.commit('loading', false)
      }
    },
    async handlePageChange(data) {
      this.sampleGroups.queryParams = { page: data['current-page'], per_page: Number(data['page-size']), groupSamplesType: 'BLSAMPLEGROUPID' }
      await this.getSampleGroups()
    },
    getValidSamplesInContainer(samples) {
      return samples.filter(sample => Number(sample.VALID) === 1)
    },
    async fetchLatestSampleGroupMultiplexJobs() {
      const result = await this.$store.dispatch('fetchDataFromApi', {
        url: `/processing/multiplex_jobs/groups/${this.sampleGroupId}?resultCount=3`,
        requestType: 'fetching last 3 multiplex jobs'
      })

      this.latestMultiplexJobs = Object.keys(result).reduce((acc, curr) => {
        acc.push(result[curr])

        return acc
      }, [])
      this.loadedMultiplex = true
    },
    async goToSampleGroupsDataCollections() {
      await this.$router.push(`/dc/sgid/${this.sampleGroupId}`)
    }
  },
  watch: {
    selectedSampleGroup() {
      this.onSampleGroupSelected()
    }
  }
}
</script>
<style scoped>
.processing-job-list {
  max-width: 1600px;
}
</style>
