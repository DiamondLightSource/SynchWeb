<template>
  <div class="content">
    <h1 v-if="gid">Edit Sample Group</h1>
    <h1 v-else>Add Sample Group</h1>

    <base-input-text
      outerClass="tw-flex tw-w-full"
      classObject="tw-mx-3"
      :value="groupName"
      id="name"
      :inline="true"
      @input="changeGroupName"
      @save="saveSampleGroupName"
    />

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
    />

    <div class="tw-relative tw-mt-6">
      <base-button
        v-if="selectedSampleGroups.length"
        @perform-button-action="onSaveSampleGroup"
        class="tw-text-white tw-border-green-700 tw-bg-green-500 hover:tw-bg-green-600">
        Save Sample Group
      </base-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
      sampleGroup: null
    };
  },
  computed: {
    ...mapGetters({
      selectedSampleGroups: ['sampleGroups/getSelectedSampleGroups'],
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

      if (!this.gid) {
        this.sampleGroup.reset(this.selectedSampleGroups)
      } else {
        const samples = this.selectedSampleGroups.map(sample => ({ ...sample, BLSAMPLEGROUPID: this.gid }))
        this.sampleGroup.reset(samples)
      }

      await this.$store.dispatch('saveCollection', { collection: this.sampleGroup })

      this.$store.commit('loading', false)
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
      let type = item.CONTAINERTYPE;
      this.selectedContainerName = `${item.CONTAINERID} - ${item.BARCODE}`
      this.containerSamples.queryParams.cid = item.CONTAINERID

      const samplesData = await this.$store.dispatch('getCollection', this.containerSamples)

      this.samples = samplesData.toJSON()
      this.setContainerType(type);
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
    }
  }
};
</script>
