<template>
  <div class="content">
    <h1>Container {{container.NAME}}</h1>

    <a name="top"></a>
    <p class="help">This page shows the contents of the selected container. Samples can be added and edited by clicking the pencil icon, and removed by clicking the x</p>

    <p v-if="container.CONTAINERSTATUS == 'processing'" class="message alert">This container is currently assigned and in use on a beamline sample changer. Unassign it to make it editable</p>

    <div class="tw-flex puck_wrap">

      <div class="form vform tw-w-2/3">
        <ul>
          <li>
            <span class="label">Name</span>
            <base-input-text v-model="container.NAME" :inline="true" @save="save('NAME')"/>
          </li>

          <li>
            <span class="label">Shipment</span>
            <span><a class="tw-underline" :href="'/shipments/sid/'+container.SHIPPINGID">{{container.SHIPMENT}}</a></span>
          </li>

          <li>
            <span class="label">Dewar</span>
            <span>{{container.DEWAR}}</span>
          </li>
          <li>
            <span class="label">Container Type</span>
            <span>{{container.CONTAINERTYPE}}</span>
          </li>
          <li>
            <span class="label">Registered Container</span>
            <span class="CONTAINERREGISTRYID">{{container.REGISTRY}}</span>
            <a v-if="container.CONTAINERREGISTRYID" class="crlink" :href="'/containers/registry/'+container.CONTAINERREGISTRYID">[View]</a>
          </li>
          <li>
            <span class="label">Barcode</span>
            <base-input-text v-model="container.BARCODE" :inline="true" @save="save('BARCODE')"/>
          </li>

          <li v-if="container.EXPERIMENTTYPE">
            <span class="label">Experiment Type</span>
            <span class="EXPERIMENTTYPE">{{container.EXPERIMENTTYPE}}</span>
          </li>

          <li v-if="container.STORAGETEMPERATURE">
            <span class="label">Storage Temperature</span>
            <base-input-text v-model="container.STORAGETEMPERATURE" :inline="true" @save="save('STORAGETEMPERATURE')"/>
          </li>

          <li v-if="container.VISIT">
            <span class="label">Data Collections</span>
            <span><a :href="'/dc/visit/'+container.VISIT" class="button"><i class="fa fa-search"></i> <span>View</span></a></span>
          </li>

          <li>
            <span class="label">Comments</span>
            <base-input-text v-model="container.COMMENTS" :inline="true" @save="save('COMMENTS')"/>
          </li>

          <li class="clearfix">
            <span class="label">Location History</span>
            <div class="history tw-inline-block tw-w-1/3">
              <table-component
                :headers="containerHistoryHeaders"
                :data="containerHistory"
                noDataText="No history available"/>
              <pagination-component @page-changed="onUpdateHistory" />
            </div>
          </li>
        </ul>
      </div> <!-- End Container Form Elements -->

      <div class="puck tw-w-2/3" title="Click to jump to a position in the puck">
        <container-graphic
          v-if="plateKey>0"
          :geometry="containerGeometry"
          :containerType="containerGraphicType"
          :samples="samples"
          :key="plateKey"
          @cell-clicked="onContainerCellClicked"/>
      </div>

    </div> <!-- End flex puck wrap-->

    <div class="table sample">
      <sample-editor
        v-if="plateType"
        :sampleComponent="plateType"
        :capacity="container.CAPACITY"
        :experimentKind="container.EXPERIMENTTYPE"
        :samplesCollection="samplesCollection"
        :proteins="proteinsCollection"
        :gproteins="gProteinsCollection"
        :automated="container.AUTOMATED"
        :containerId="container.CONTAINERID"
      ></sample-editor>
    </div>

  </div>
</template>

<script>
import ContainerHistory from 'modules/shipment/collections/containerhistory'
import ContainerTypes from 'modules/shipment/collections/containertypes'
import DistinctProteins from 'modules/shipment/collections/distinctproteins'
import Sample from 'models/sample'
import Samples from 'collections/samples'
import SampleEditor from 'modules/shipment/components/samples/SampleEditor.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'

import ContainerGraphic from 'modules/shipment/components/ContainerGraphic.vue'
import TableComponent from 'app/components/table.vue'
import PaginationComponent from 'app/components/pagination.vue'


// Use Location as idAttribute for this table
var LocationSample = Sample.extend({
    idAttribute: 'LOCATION',
})


export default {
  name: 'saxs-container-view',
  components: {
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-select': BaseInputSelect,
    'sample-editor': SampleEditor,
    'container-graphic': ContainerGraphic,
    'table-component': TableComponent,
    'pagination-component': PaginationComponent
  },
  props: {
    containerModel: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      container: {},
      containerId: 0,
      samples: [],
      samplesCollection: null,

      containerGeometry: {
        capacity: 0,
        columns: 0,
        drops: {
          x: 0,
          y: 0,
          h: 0,
          w: 0,
        },
        well: -1,
      },

      containerHistory: [],
      containerHistoryHeaders: [
        {key: 'DATE', title: 'Date'},
        {key: 'DEWARSTATUS', title: 'Status'},
        {key: 'STORAGELOCATION', title: 'Location'},
        {key: 'BL', title: 'Beamline'},
      ],
      containerHistoryTotal: 0,

      containerTypes: [],
      plateType: null, // Stores if a puck or plate type
      containerGraphicType: '',
      plateKey: 0,

      proteinsCollection: [],
      gProteinsCollection: [],
    }
  },
  // computed: {
  //   plateType: function() {
  //     // This determines the component used in sample editor
  //     if (this.container.NAME.indexOf('Puck') > -1) return 'puck'

  //     return this.container.CAPACITY > 25 ? 'single-sample-plate' : 'sample-plate-edit'
  //   }
  // },
  created: function() {
    console.log("Sample Plate Editor created")

    // Get samples for this container id
    this.container = Object.assign({}, this.containerModel.toJSON())
    this.containerId = this.containerModel.get('CONTAINERID')

    this.samplesCollection = new Samples()
    this.samplesCollection.queryParams.cid = this.containerId
    this.getSamples(this.samplesCollection)

    let collection = new ContainerHistory()
    this.getHistory(collection)

    this.proteinsCollection = new DistinctProteins()
    // If we want to only allow valid samples
    if (app.options.get('valid_components') && !app.staff) {
        this.proteinsCollection.queryParams.external = 1
    }

    this.$store.dispatch('getCollection', this.proteinsCollection).then( (result) => {
      console.log("Proteins = " + JSON.stringify(result))
    })

    // Get the geometry for this container type
    // When backend can get container type by name or id we can make this more efficient
    let containerTypesCollection = new ContainerTypes()
    this.$store.dispatch('getCollection', containerTypesCollection).then( (result) => {
      let containerTypeModel = result.findWhere({NAME: this.container.CONTAINERTYPE})
      if (containerTypeModel) this.updateContainerGeometry(containerTypeModel)
      else console.log("Container plate view cant find " + this.container.CONTAINERTYPE)
    })
  },
  methods: {
    // Callback from pagination
    onUpdateHistory: function(payload) {
      let collection = new ContainerHistory( null, {state: { pageSize: payload.pageSize, currentPage: payload.currentPage}})
      this.getHistory(collection)
    },
    // Effetively a patch request to update specific fields
    save: function(parameter) {
      let params = {}
      params[parameter] = this.container[parameter]

      this.$store.dispatch('saveModel', {model: this.containerModel, attributes: params})
    },
    getHistory: function(collection) {
      // Make sure we are getting history for this container
      collection.queryParams.cid = this.containerId
      // Fetch the history and content for this container
      this.$store.dispatch('getCollection', collection).then( (history) => {
        this.containerHistory = history.toJSON()
        this.containerHistoryTotal = history.state.totalRecords
      })
    },
    getSamples: function(collection) {
      this.$store.dispatch('getCollection', collection).then( (result) => {
        console.log("Container plate view got samples")
        if (result) {
          this.resetSamples(this.container.CAPACITY)
        } else console.log("No samples found")
      }, () => console.log("Saxs Plate View - Error getting samples"))
    },
    // Move this to container graphic
    // Convert model into geometry
    updateContainerGeometry: function(geometry) {
      console.log("Container plate view update geometry: " + geometry.toJSON())
      this.containerGeometry.capacity = geometry.get('CAPACITY')
      this.containerGeometry.drops.x = geometry.get('DROPPERWELLX')
      this.containerGeometry.drops.y = geometry.get('DROPPERWELLY')
      this.containerGeometry.drops.h = geometry.get('DROPHEIGHT')
      this.containerGeometry.drops.w = geometry.get('DROPWIDTH')
      this.containerGeometry.well = geometry.get('WELLDROP')
      if (geometry.get('WELLPERROW')) {
        this.containerGeometry.columns = geometry.get('WELLPERROW')
        console.log("Number of plate = " + geometry.get('NAME'))
        console.log("Number of columns = " + this.containerGeometry.columns)
        this.plateType = this.containerGeometry.capacity > 25 ? 'single-sample-plate' : 'sample-plate-edit'
        this.containerGraphicType = 'plate'
      } else {
        this.containerGraphicType = 'puck'
        this.plateType = 'puck'
      }
      this.plateKey += 1
    },
    // Reset Backbone Samples Collection
    resetSamples: function(capacity) {
      console.log("Resetting Samples Collection, capacity: " + capacity)
      var samples = Array.from({length: capacity}, (_,i) => new LocationSample({ BLSAMPLEID: null, LOCATION: (i+1).toString(), PROTEINID: -1, CRYSTALID: -1, new: true }))

      this.samplesCollection.each( s => {
        console.log("CPV model = " + s.toJSON())
        let i = +(s.get('LOCATION')) - 1
        samples[i] = Object.assign(samples[i], s)
      })
      this.samplesCollection.reset(samples)
    },

  }
}
</script>