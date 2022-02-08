<template>
  <div class="content">
    <h1>Sample Group Management</h1>

    <div class="r tw-mb-2">
      <button @click="onAddSampleGroup" class="button">
        <i class="fa fa-plus"></i> Add Sample Group
      </button>
    </div>
    <table-panel
      :headers="headers"
      :data="groups"
      @row-clicked="selectSampleGroup"
    ></table-panel>

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
      <table-panel
        :headers="sampleGroupHeaders"
        :data="sampleGroupMembers"
      ></table-panel>

      <pagination-panel
        :initial-page="sampleGroupSamplesListState.firstPage"
        :totalRecords="sampleGroupSamplesListState.totalRecords"
        :pageLinks="5"
        @page-changed="handleSampleGroupSamplePageChange"
      />
    </div>
  </div>
</template>

<script>
import ContainerGraphic from "./ContainerGraphic.vue";

import Table from 'app/components/table.vue'
import Pagination from 'app/components/pagination.vue'

import SampleGroupsNamesCollection from 'collections/samplegroupnames.js'
import SampleGroupSamplesCollection from 'collections/samplegroupsamples.js'

export default {
  name: 'sample-group-management',
  components: {
    'table-panel': Table,
    'pagination-panel': Pagination,
    'container-graphic': ContainerGraphic
  },

  data: function () {
    return {
      headers: [
        { title: "Group Name", key: "NAME" },
        { title: "Number of Samples", key: "SAMPLEGROUPSAMPLES" },
      ],
      sampleGroupHeaders: [
        { title: "Name", key: "SAMPLE" },
        { title: "Protein", key: "PROTEIN" }
      ],
      sampleGroups: null, // backbone collection
      sampleGroupSamples: null,
      groups: [],

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
      sampleGroupId: null,
      sampleGroupsListState: {},
      sampleGroupSamplesListState: {},
      selectedSampleGroup: null
    };
  },
  created() {
    this.sampleGroups = new SampleGroupsNamesCollection(null, { state: { pageSize: 15 } })
    this.sampleGroupSamples = new SampleGroupSamplesCollection(null, { state: { pageSize: 15 } })
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
        this.sampleGroupSamples.queryParams.BLSAMPLEGROUPID = this.sampleGroupId   
  
        const collection = await this.$store.dispatch(
          'getCollection',
          this.sampleGroupSamples
        )
  
        this.sampleGroupMembers = collection.toJSON()

        this.sampleGroupSamplesListState = collection.state
        this.$store.commit('loading', false)
      } catch (error) {
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
  
        const collection = await this.$store.dispatch(
          'getCollection',
          this.sampleGroups
        )
  
        this.groups = collection.toJSON()
        this.sampleGroupsListState = collection.state
        this.$store.commit('loading', false)
      } catch (error) {
        this.$store.commit('loading', false)
      }
    },
    async handlePageChange(data) {
      this.sampleGroups.queryParams = { page: data['current-page'], per_page: Number(data['page-size'])}
      await this.getSampleGroups()
    },
    async handleSampleGroupSamplePageChange(data) {
      this.sampleGroupSamples.queryParams = { page: data['current-page'], per_page: Number(data['page-size'])}
      await this.onSampleGroupSelected()
    }
  },
  watch: {
    selectedSampleGroup() {
      this.onSampleGroupSelected()
    }
  }
}
</script>
