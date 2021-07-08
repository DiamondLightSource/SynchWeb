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
            <div class="history tw-inline-block tw-w-2/3">
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
        <valid-container-graphic
          :containerType="containerType"
          :samples="validSamples"
          @cell-clicked="onContainerCellClicked"/>
      </div>

    </div> <!-- End flex puck wrap-->

    <div class="table sample">
      <sample-editor
        v-if="proteinsLoaded"
        :containerType="containerType"
        :experimentKind="experimentKind"
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
import ExperimentTypes from 'modules/shipment/collections/experimenttypes'
import EventBus from 'app/components/utils/event-bus.js'
import Samples from 'collections/samples'
import SampleEditor from 'modules/types/saxs/samples/sample-editor.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'

import ValidContainerGraphic from 'modules/types/saxs/samples/valid-container-graphic.vue'
import TableComponent from 'app/components/table.vue'
import PaginationComponent from 'app/components/pagination.vue'

import { mapGetters } from 'vuex'

const INITIAL_CONTAINER_TYPE = {
  CONTAINERTYPEID: 0,
  CAPACITY: 0,
  DROPPERWELLX: null,
  DROPPERWELLY: null,
  DROPHEIGHT: null,
  DROPWIDTH: null,
  WELLDROP: -1,
  WELLPERROW: null,
}

export default {
  name: 'saxs-container-view',
  components: {
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-select': BaseInputSelect,
    'sample-editor': SampleEditor,
    'valid-container-graphic': ValidContainerGraphic,
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
      samplesCollection: null,

      containerHistory: [],
      containerHistoryHeaders: [
        {key: 'BLTIMESTAMP', title: 'Date'},
        {key: 'STATUS', title: 'Status'},
        {key: 'LOCATION', title: 'Location'},
      ],
      containerHistoryTotal: 0,

      containerTypes: [],
      experimentKind: null,
      plateType: null, // Stores if a puck or plate type
      containerType: '',
      plateKey: 0,

      proteinsCollection: [],
      gProteinsCollection: [],
    }
  },
  computed: {

		validSamples: function() {
      return this.samples.map( (entry) => {
        let sample = {}
        sample.LOCATION = entry.LOCATION
        sample.NAME = entry.NAME
        sample.VALID = -1
        if (entry.NAME && entry.PROTEINID > 0) sample.VALID = 1
        else if ( !entry.NAME && entry.PROTEINID < 0 ) sample.VALID = 0

        return sample
      })
    },

    ...mapGetters('samples', ['samples']),
  },
  created: function() {
    console.log("CONTAINER PLATE VIEW")
    // Get samples for this container id
    this.container = Object.assign({}, this.containerModel.toJSON())
    this.containerId = this.containerModel.get('CONTAINERID')
    console.log("CONTAINER PLATE MODEL CAPACITY = " + this.container.CAPACITY)

    this.samplesCollection = new Samples()
    this.samplesCollection.queryParams.cid = this.containerId
    this.getSamples(this.samplesCollection)

    this.getHistory()

    this.getExperimentTypes()

    this.getProteins()

    this.getContainerTypes()

  },
  methods: {
    getProteins: function() {
      this.proteinsCollection = new DistinctProteins()
      this.gProteinsCollection = new DistinctProteins()
      // If we want to only allow valid samples
      if (app.options.get('valid_components') && !app.staff) {
          this.proteinsCollection.queryParams.external = 1
      }
      
      this.$store.dispatch('getCollection', this.proteinsCollection).then( (result) => {
        this.proteins = result.toJSON()
        this.proteinsLoaded = true
      })
    },
    getContainerTypes: function() {
      // Get the geometry for this container type
      // When backend can get container type by name or id we can make this more efficient
      let containerTypesCollection = new ContainerTypes()
      this.$store.dispatch('getCollection', containerTypesCollection).then( (result) => {
        let containerTypeModel = result.findWhere({NAME: this.container.CONTAINERTYPE})

        if (containerTypeModel) {
          this.containerType = Object.assign(INITIAL_CONTAINER_TYPE, containerTypeModel.toJSON())
        }
        else console.log("Container plate view cant find " + this.container.CONTAINERTYPE)
      })
    },
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
    getHistory: function() {
      let collection = new ContainerHistory()
    
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
        if (result) {
          this.resetSamples(this.container.CAPACITY)
        } else console.log("No samples found")
      }, () => console.log("Saxs Plate View - Error getting samples"))
    },
    getExperimentTypes: function() {
      let experimentTypesCollection = new ExperimentTypes()

      this.$store.dispatch('getCollection', experimentTypesCollection).then( (result) => {
        let experimentType = this.findExperimentType(result)

        this.experimentKind = experimentType.length > 0 ? experimentType[0].EXPERIMENTTYPEID : 0
        console.log("Found experiment type for this container " + JSON.stringify(this.experimentKind))
      })

    },
    findExperimentType: function(collection) {
      let proposalType = this.$store.state.proposal.proposalType
      let experimentTypes = collection.toJSON()
      let filteredTypes = []
      // Try to find the experiment Type ID from the group of experiment types
      filteredTypes = experimentTypes.filter( (type) => {
        if (type.NAME == this.container.EXPERIMENTTYPE && type.PROPOSALTYPE == proposalType) return true
      })
      // Try to find the experiment Type ID from all experiment types
      if (!filteredTypes) {
        filteredTypes = experimentTypes.filter( (type) => {
          if (type.NAME == this.container.EXPERIMENTTYPE) return true
        })
      }
      return filteredTypes
    },
    // Reset Backbone Samples Collection
    resetSamples: function(capacity) {
      this.$store.commit('samples/reset', capacity)

      this.samplesCollection.each( s => {
        let i = +(s.get('LOCATION')) - 1
        this.$store.commit('samples/setSample', {index: i, data: s.toJSON()})
      })
    },
    onContainerCellClicked: function(location) {
      EventBus.$emit('select-sample', location)
    },
  }
}
</script>