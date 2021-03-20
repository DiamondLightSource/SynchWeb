<template>
  <div class="content">
    <h1 v-if="gid">Edit Sample Group</h1>
    <h1 v-else>Add Sample Group</h1>

    <base-input-text
      v-if="gid"
      outerClass="tw-w-full"
      inputClass="tw-mx-3 tw-mb-4"
      :value="groupName"
      id="name"
      label="Group Name"
      :inline="true"
      @input="changeGroupName"
      @save="saveSampleGroupName"
    />

    <div v-else><p class="tw-text">Create a sample group first before creating a name</p></div>

    <div v-if="sampleGroupMembers.length > 0" class="content">
      <h1>Sample Group {{ sampleGroupName }}</h1>
      <table-panel
        :headers="sampleGroupHeaders"
        :data="sampleGroupMembers"
      ></table-panel>
    </div>

    <div v-if="containers.length > 0" class="content">
      <h1>Containers</h1>
      <table-panel
        :headers="containerHeaders"
        :data="containers"
        @row-clicked="onContainerSelected"
      ></table-panel>

      <pagination-panel />
    </div>

    <container-graphic
      v-if="containerSelected"
      :selectedContainerName="selectedContainerName"
      :geometry="containerGeometry"
      :containerType="containerType"
      :samples=samples
      :selectedSamples="selectedSamplesInGroups[selectedContainerName]"
      @unselect-cell="deselectCells"
      @cell-clicked="addSelectedCells"
    />

    <div class="tw-w-full tw-m-1 tw-p-2" v-if="Object.keys(selectedSamplesInGroups).length > 0">
      <h1 class="tw-text-xl tw-my-3">Selected Samples</h1>
      <div class="tw-w-full tw-flex">
        <p class="tw-text tw-mr-4 tw-w-1/4">Container Name</p>
        <p class="tw-text">Samples</p>
      </div>
      <div
        v-for="(containerSelectedSamples, containerNames) in selectedSamplesInGroups"
        :key="containerNames"
        class="tw-flex tw-my-3"
      >
        <p class="tw-text tw-mr-4 tw-w-1/4">{{ containerNames }}</p>
        <p class="tw-text">{{ extractSampleNamesFromList(containerSelectedSamples) }} ...</p>
      </div>
    </div>

    <div class="tw-relative tw-mt-6">
      <base-button
        class="button"
        v-if="Object.keys(selectedSamplesInGroups).length > 0"
        @perform-button-action="onSaveSampleGroup"
      >
        Save Sample Group
      </base-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { difference, uniq, get as lodashGet, values, flatten } from 'lodash-es'
import ContainerGraphic from './ContainerGraphic.vue'

import Table from 'app/components/utils/table.vue'
import Pagination from 'app/components/utils/pagination.vue'
import PaginationTable from 'app/components/utils/pagination-table.vue'
import BaseButton from 'app/components/base-button.vue'
import BaseInputText from 'app/components/base-input-text.vue'

import SampleGroupsCollection from 'collections/samplegroups.js'
import ContainersCollection from 'collections/containers.js'
import SamplesCollection from 'collections/samples.js'


import ContainerTypes from 'modules/shipment/collections/platetypes.js'

export default {
  name: 'sample-group-edit',
  props: {
    gid: Number
  },
  components: {
    'table-panel': Table,
    'pagination-panel': Pagination,
    'container-graphic': ContainerGraphic,
    'pagination-table': PaginationTable,
    'base-button': BaseButton,
    'base-input-text': BaseInputText
  },
  data: function () {
    return {
      groupName: '',
      lockName: this.gid ? true : false,
      sampleGroupHeaders: [
        { title: 'ID', key: 'BLSAMPLEID' },
        { title: 'Name', key: 'SAMPLE' },
        { title: 'Container', key: 'CONTAINER' },
        { title: 'Protein', key: 'PROTEIN' },
      ],
      containerHeaders: [
        { title: 'ID', key: 'CONTAINERID' },
        { title: 'Name', key: 'NAME' },
        { title: 'Container Type', key: 'CONTAINERTYPE' },
        { title: 'BarCode', key: 'BARCODE' },
        { title: 'Dewar', key: 'DEWAR' },
        { title: 'Shipment', key: 'SHIPMENT' },
      ],
      containers: [],
      containerTypes: null,
      containerGeometry: {
        capacity: 0,
        columns: 0,
        drops: {
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        well: null,
      },
      containerType: null, // Can be plate or puck
      sampleGroupMembers: [],
      sampleGroupName: null,
      containerSelected: false,
      selectedContainerName: '',
      samples: [],
      sampleGroup: null,
      selectedContainerList: {}
    };
  },
  computed: {
    ...mapGetters({
      selectedSamplesInGroups: ['sampleGroups/getSelectedSampleGroups'],
      proposalModel: ['proposal/currentProposalModel'],
      selectedSampleGroupName: ['sampleGroups/getSelectedSampleGroupName']
    })
  },
  created: function () {
    this.containerTypes = new ContainerTypes()
    this.containers = new ContainersCollection()
    this.sampleGroup = new SampleGroupsCollection()
    this.containerSamples = new SamplesCollection()
  },
  mounted() {
    this.fetchContainers()
    if (this.gid) {
      this.getSampleGroupModel()
    }
    this.groupName = this.selectedSampleGroupName ? this.selectedSampleGroupName : 'New Sample Group'
  },
  methods: {
    async fetchContainers() {
      try {
        this.$store.commit('loading', true)

        const containers = await this.$store.dispatch('getCollection', this.containers)

        this.containers = containers.toJSON()
      } catch (error) {
        console.log(error.message)
      } finally {
        this.$store.commit('loading', false)
      }
    },
    async onSaveSampleGroup() {
      this.$store.commit('loading', true)

      const samples = Object.values(this.selectedSamplesInGroups).flat()

      if (!this.gid) {
        this.sampleGroup.reset(samples)
      } else {
        const samplesWithSampleGroupId = samples.map(sample => ({ ...sample, BLSAMPLEGROUPID: this.gid }))
        this.sampleGroup.reset(samplesWithSampleGroupId)
      }

      const result = await this.$store.dispatch('saveCollection', { collection: this.sampleGroup })
      this.$store.commit('sampleGroups/resetSelectedSampleGroups')
      this.$store.commit('loading', false)

      const savedSamples = result.toJSON()
      this.$router.push(`/samples/groups/edit/id/${savedSamples[0].BLSAMPLEGROUPID}`)
    },
    setContainerType(type) {
      // Returns a backbone model that we need to map to our geometry structure
      let container = this.containerTypes.findWhere({ name: type });

      this.containerGeometry.capacity = container.get('capacity');
      this.containerGeometry.columns = container.get('well_per_row');
      this.containerGeometry.drops.x = container.get('drop_per_well_x');
      this.containerGeometry.drops.y = container.get('drop_per_well_y');
      this.containerGeometry.drops.h = container.get('drop_height');
      this.containerGeometry.drops.w = container.get('drop_width');
      this.containerGeometry.well = container.get('well_drop') > 0 ? container.get('well_drop') : null;

      this.containerType = container.get('well_per_row') ? 'plate' : 'puck';

      this.containerSelected = true;
    },
    async onContainerSelected(item) {
      this.$store.commit('loading', true)

      let type = item.CONTAINERTYPE
      this.selectedContainerName = `${item.CONTAINERID} - ${item.BARCODE}`
      this.containerSamples.queryParams.cid = item.CONTAINERID

      const samplesData = await this.$store.dispatch('getCollection', this.containerSamples)

      this.samples = samplesData.toJSON()
      this.setContainerType(type);

      this.$store.commit('loading', false)
    },
    saveSampleGroupName() {
      const sampleGroupModel = this.sampleGroup.sampleGroupNameModel()
      this.$store.dispatch('saveModel', {
        model: sampleGroupModel,
        attributes: { BLSAMPLEGROUPID: this.gid, NAME: this.groupName }
      })
    },
    changeGroupName(value) {
      this.groupName = value
    },
    addSelectedCells(cellsLocation) {
      const fullSampleDetails = this.getFullSamplesDetails(cellsLocation)
      const selectedContainerSamples = lodashGet(this.selectedSamplesInGroups, this.selectedContainerName, [])
      const updatedSelectedContainerSamples = uniq(selectedContainerSamples.concat(fullSampleDetails))

      this.$store.commit('sampleGroups/setSelectedSampleGroups', { [this.selectedContainerName]: updatedSelectedContainerSamples })
    },
    deselectCells(cellsLocation) {
      const fullSampleDetails = this.getFullSamplesDetails(cellsLocation)
      const selectedContainerSamples = lodashGet(this.selectedSamplesInGroups, this.selectedContainerName)
      const updatedSelectedContainerSamples = difference(selectedContainerSamples, fullSampleDetails)

      this.$store.commit('sampleGroups/setSelectedSampleGroups', { [this.selectedContainerName]: updatedSelectedContainerSamples })
    },
    getFullSamplesDetails(cellsLocation) {
      return cellsLocation.reduce((samples, location) => {
        const sample = this.samples.find(sample => Number(sample.LOCATION) === Number(location))
        if (typeof sample !== 'undefined') {
          samples.push(sample)
        }

        return samples

      }, [])
    },
    // Remove when we start persisting the vuex store
    async getSampleGroupModel() {
      try {
        this.$store.commit('loading', true)
  
        const sampleGroupModel = this.sampleGroup.sampleGroupNameModel({ BLSAMPLEGROUPID: this.gid })
        const result = await this.$store.dispatch(
          'getModel',
          sampleGroupModel
        )
  
        let model = result.toJSON()
        this.groupName = model.NAME
        this.$store.commit('loading', false)
      } catch (error) {
        this.$store.commit('loading', false)
      }
    },
    extractSampleNamesFromList(list) {
      return list.slice(0, 3).map(item => item.NAME).join(', ')
    }
  }
};
</script>
