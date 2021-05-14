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
      @row-clicked="onSampleGroupSelected"
    ></table-panel>

    <pagination-panel class="tw-mb-5" />

    <div v-if="sampleGroupMembers.length > 0" class="content">
      <h1>Sample Group {{ sampleGroupName }}</h1>
      <div class="tw-flex tw-justify-end">
        <button v-if="sampleGroupId" @click="onEditSampleGroup(sampleGroupId)" class="button">
          <i class="fa fa-plus"></i> Edit Sample Group
        </button>
      </div>
      <table-panel
        :headers="sampleGroupHeaders"
        :data="sampleGroupMembers"
      ></table-panel>

      <pagination-panel />
    </div>
  </div>
</template>

<script>
import ContainerGraphic from "./ContainerGraphic.vue";

import Table from 'app/components/table.vue'
import Pagination from 'app/components/pagination.vue'

import SampleGroupsCollection from 'collections/samplegroups.js'

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
        { title: "Number of Samples", key: "NUM_MEMBERS" },
      ],
      sampleGroupHeaders: [
        { title: "Name", key: "SAMPLE" },
        { title: "Protein", key: "PROTEIN" }
      ],
      sampleGroups: null, // backbone collection
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
    };
  },
  created() {
    this.sampleGroups = new SampleGroupsCollection()
  },
  mounted() {
    this.getSampleGroups();
  },

  methods: {
    onSampleGroupSelected: function (item) {
      this.sampleGroupMembers = item.MEMBERS.toJSON()
      this.sampleGroupName = item.NAME
      this.sampleGroupId = item.BLSAMPLEGROUPID
    },
    async onEditSampleGroup() {
      await this.$store.commit('sampleGroups/resetSelectedSampleGroups')
      this.$router.push('/samples/groups/edit/id/' + this.sampleGroupId)
    },
    async onAddSampleGroup() {
      await this.$store.commit('sampleGroups/resetSelectedSampleGroups')
      this.$router.push({ name: 'samples-group-edit' })
    },
    // Wrap the method to get collection as promise
    async getSampleGroups() {
      try {
        this.$store.commit('loading', true)
  
        const result = await this.$store.dispatch(
          'getCollection',
          this.sampleGroups
        )
  
        let collection = result.groups()
  
        this.groups = collection.toJSON()
        this.$store.commit('loading', false)
      } catch (error) {
        this.$store.commit('loading', false)
      }
    }
  }
}
</script>
