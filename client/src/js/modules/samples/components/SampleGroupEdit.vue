<template>

  <div class="content">
    <h1 v-if="gid">Edit Sample Group</h1>
    <h1 v-else>Add Sample Group</h1>

    <form>
      <label for="name">Sample Group Name</label>
      <input v-model="groupName" type="text" placeholder="group name">
    </form>


    <div v-if="sampleGroupMembers.length > 0" class="content">
      <h1>Sample Group {{sampleGroupName}}</h1>
      <table-panel
        :headers="sampleGroupHeaders"
        :data="sampleGroupMembers"
      ></table-panel>
    </div>

    <h1>Shipments</h1>
    <table-panel
      :headers="shipmentHeaders"
      :data="shipments"
      @row-clicked="onShipmentSelected"
    ></table-panel>

    <div v-if="dewars.length > 0" class="content">
    <h1>Dewars</h1>
    <table-panel
      :headers="dewarHeaders"
      :data="dewars"
      @row-clicked="onDewarSelected"
    ></table-panel>

    </div>

    <div v-if="containers.length > 0" class="content">
    <h1>Containers</h1>
    <table-panel
      :headers="containerHeaders"
      :data="containers"
      @row-clicked="onContainerSelected"
    ></table-panel>

    </div>

    <button @click.prevent="onSaveSampleGroup" class="r tw-rounded tw-px-4 tw-py-2 tw-text-white tw-border tw-border-green-700 tw-bg-green-500 hover:tw-bg-green-600">Save Sample Group</button>

    <container-graphic
    :geometry="containerGeometry"
    :containerType="containerType"/>



  </div>
</template>

<script>

import ContainerGraphic from './ContainerGraphic.vue'

import Table from 'app/components/utils/table.vue'
import Pagination from 'app/components/utils/pagination.vue'
import PaginationTable from 'app/components/utils/pagination-table.vue'

import SampleGroupsCollection from 'collections/samplegroups.js'
import ShipmentCollection from 'collections/shipments.js'
import DewarsCollection from 'collections/dewars.js'
import ContainersCollection from 'collections/containers.js'

import ContainerTypes from 'modules/shipment/collections/platetypes.js'

export default {
  name: "sample-group-edit",
  props: {
    'gid': Number,
    'sampleGroup': Object
  },
  components: {
    'table-panel': Table,
    'pagination-panel': Pagination,
    'container-graphic': ContainerGraphic,
    'pagination-table': PaginationTable,
  },
  data: function() {
    return {
      groupName: "New Sample Group",
      lockName: this.gid ? true : false,

      sampleGroupHeaders: [
        { title: 'ID', key: 'BLSAMPLEID'},
        { title: 'Name', key: 'SAMPLE'},
        { title: 'Container', key: 'CONTAINER'},
        { title: 'Protein', key: 'PROTEIN'},
      ],
      sampleGroups: null, // backbone collection
      groups: [],

      shipmentHeaders: [
        { title: 'ID', key: 'SHIPPINGID'},
        { title: 'Name', key: 'SHIPPINGNAME'},
        { title: 'Status', key: 'STATUS'},
        { title: 'Number of Dewars', key: 'DCOUNT'},
      ],
      shipments: [],
      shipmentCollection: null,

      dewarHeaders: [
        { title: 'ID', key: 'DEWARID'},
        { title: 'Name', key: 'DEWARNAME'},
        { title: 'Facility Code', key: 'FACILITYCODE'},
        { title: 'BarCode', key: 'BARCODE'},
        { title: 'Status', key: 'DEWARSTATUS'},
      ],
      dewars: [],
      containerHeaders: [
        { title: 'ID', key: 'CONTAINERID'},
        { title: 'Name', key: 'NAME'},
        { title: 'Container Type', key: 'CONTAINERTYPE'},
        { title: 'BarCode', key: 'BARCODE'},
        { title: 'Dewar', key: 'DEWAR'},
        { title: 'Shipment', key: 'SHIPMENT'},
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
          h: 0
        },
        well: null
      },
      containerType: null, // Can be plate or puck

      sampleGroupMembers: [],
      sampleGroupName: null,
    }
  },

  created: function() {
    this.containerTypes = new ContainerTypes()
    // this.sampleGroups = new SampleGroupsCollection()
    this.shipmentCollection = new ShipmentCollection()

    this.sampleGroups = new SampleGroupsCollection()
  },
  mounted: function() {
    this.$store.commit('loading', true)

    this.getSampleGroups().then( (result) => {
      // Store sample groups as the list
      // for some reason groups method gives us an array of arrays!!!
      let collection = result.groups()

      console.log("COLLECTION = " + JSON.stringify(collection))

      // We can store the result as the backbone collection - needed?
      this.sampleGroups = Object.assign(this.sampleGroups, result)

      // Update the sample group mapping we need
      this.groups = collection.toJSON()

      // this.sampleGroupMembers = collection.models[0].MEMBERS.toJSON()
      // this.sampleGroupName = item.NAME

      let group = collection.findWhere({BLSAMPLEGROUPID: this.gid})
      console.log("PLucked Group " + this.gid + " = " + JSON.stringify(group))

    }, (err) => console.log("Sample group error " + JSON.stringify(err))
    ).finally( () => {
      this.$store.commit('loading', false)
    })



    this.getShipments().then( (result) => {
      // We can store the result as the backbone collection - needed?
      // Update the sample group mapping we need
      console.log("Shipment from server collection = " + JSON.stringify(result.toJSON()) )

      // Setting this array to a new one will work with Vue reactivity
      this.shipments = result.toJSON()

    }, (err) => console.log("Sample group error " + JSON.stringify(err))
    ).finally( () => {
      this.$store.commit('loading', false)
    })
  },

  methods: {
    onSaveSampleGroup: function() {
      console.log("Save Sample Group")
    },

    onShipmentSelected: function(item) {
      console.log("Shipment ID Clicked: " + item.SHIPPINGID)
      // Reset containers view
      this.containers = []

      this.getDewars(item.SHIPPINGID).then( (result ) => {
        this.dewars = result.toJSON()
      })
    },

    onDewarSelected: function(item) {
      console.log("Dewar ID Clicked: " + item.DEWARID)

      this.getContainers(item.DEWARID).then( (result ) => {
        this.containers = result.toJSON()
      })
    },

    setContainerType: function(type) {
      // let type = 'CrystalQuickX'
      // let type = 'FilmBatch'
      // let type = 'MitegenInSitu_3_Drop'
      // Returns a backbone model that we need to map to our geometry structure
      let container = this.containerTypes.findWhere({name: type})

      console.log("Found container geometry for type: " + type + " = " + JSON.stringify(container))

      this.containerGeometry.capacity = container.get('capacity')
      this.containerGeometry.columns = container.get('well_per_row')
      this.containerGeometry.drops.x = container.get('drop_per_well_x')
      this.containerGeometry.drops.y = container.get('drop_per_well_y')
      this.containerGeometry.drops.h = container.get('drop_height')
      this.containerGeometry.drops.w = container.get('drop_width')
      this.containerGeometry.well = container.get('well_drop') > 0 ? container.get('well_drop') : null

      this.containerType = container.get('well_per_row') ? 'plate' : 'puck'

      console.log("Container Type = " + this.containerType)
    },

    onContainerSelected: function(item) {
      console.log("Container ID Clicked: " + item.CONTAINERID)
      // What type of container is it?
      let type = item.CONTAINERTYPE
      this.setContainerType(type)
    },

    // Wrap the method to get collection as promise
    getSampleGroups: function() {
      return new Promise( (resolve, reject) => {
        this.sampleGroups.fetch( {
          success: function(collection) {
            resolve(collection)
          },
          error: function(err) {
            reject(err)
          }
        })
      })
    },

    // Wrap the method to get collection as promise
    getShipments: function() {
      return new Promise( (resolve, reject) => {
        this.shipmentCollection.fetch( {
          success: function(collection) {
            resolve(collection)
          },
          error: function(err) {
            reject(err)
          }
        })
      })
    },
    // Wrap the method to get collection as promise
    getDewars: function(id) {
      let dewars = new DewarsCollection(null, {id: id})

      return new Promise( (resolve, reject) => {
        dewars.fetch( {
          success: function(collection) {
            resolve(collection)
          },
          error: function(err) {
            reject(err)
          }
        })
      })
    },
    // Wrap the method to get collection as promise
    getContainers: function(id) {
      let containers = new ContainersCollection(null, {id: id})

      return new Promise( (resolve, reject) => {
        containers.fetch( {
          success: function(collection) {
            resolve(collection)
          },
          error: function(err) {
            reject(err)
          }
        })
      })
    }
  }
}
</script>
