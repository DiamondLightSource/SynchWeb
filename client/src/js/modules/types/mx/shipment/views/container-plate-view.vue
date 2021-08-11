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
            <span class="label">Owner</span>
            <base-input-select
              v-model="container.OWNER"
              :options="users"
              optionValueKey="PERSONID"
              :inline="true"
              @save="save('OWNERID')"
              optionTextKey="FULLNAME"/>
          </li>
          <li>
            <span class="label">Registered Container</span>
            <span class="tw-relative">{{container.REGISTRY}} <router-link :to="`/container/registry/${container.CONTAINERREGISTRYID}`" class="tw-absolute top-5 tw-text-content-page-color" >[View]</router-link></span>
          </li>
          <li>
            <span class="label">Barcode</span>
            <base-input-text
              v-model="container.BARCODE"
              :inline="true"
              initialText="Click to edit"
              @save="save('BARCODE')"/>
          </li>
          <li v-if="container.PIPELINE">
            <span class="label">Priority Processing</span>
            <base-input-select
              v-model="container.PIPELINE"
              name="PIPELINE"
              :options="processingPipelines"
              optionValueKey="PROCESSINGPIPELINEID"
              :inline="true"
              optionTextKey="NAME"
            />
          </li>

          <li>
            <span class="label">Automated Collection</span>
            <span><button class="button"><i class="fa fa-plus"></i> Queue</button> this container for Auto Collect</span>
          </li>

          <li>
            <span class="label">Comments</span>
            <base-input-text v-model="container.COMMENTS" :inline="true" @save="save('COMMENTS')" inlineText="Click to edit"/>
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

          <li>
            <span class="label">Show UDC Column</span>
            <span>
              <base-input-checkbox
                  name="ALLOW_UDC"
                  v-model="showUDCColumns"
              />
            </span>
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
        :experimentKind="container.EXPERIMENTTYPE"
        :containerId="container.CONTAINERID"
        :proteins="proteinsCollection"
        :gproteins="gProteinsCollection"
        :automated="container.AUTOMATED"
      />
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
import SampleEditor from 'modules/types/mx/samples/sample-editor.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputCheckBox from 'app/components/base-input-checkbox.vue'

import ValidContainerGraphic from 'modules/types/saxs/samples/valid-container-graphic.vue'
import TableComponent from 'app/components/table.vue'
import PaginationComponent from 'app/components/pagination.vue'
import ContainerMixin from 'modules/types/mx/shipment/views/container-mixin'

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
  name: 'mx-container-view',
  mixins: [ContainerMixin],
  components: {
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-select': BaseInputSelect,
    'sample-editor': SampleEditor,
    'valid-container-graphic': ValidContainerGraphic,
    'table-component': TableComponent,
    'pagination-component': PaginationComponent,
    'base-input-checkbox': BaseInputCheckBox
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
        {key: 'BEAMLINELOCATION', title: 'Beamline'}
      ],
      containerHistoryTotal: 0,

      experimentKind: null,
      plateType: null, // Stores if a puck or plate type
      containerType: '',
      plateKey: 0
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
    // Get samples for this container id
    this.container = Object.assign({}, this.containerModel.toJSON())
    this.containerId = this.containerModel.get('CONTAINERID')

    this.samplesCollection = new Samples()
    this.samplesCollection.queryParams.cid = this.containerId
    this.getSamples(this.samplesCollection)
    this.getHistory()
    this.getExperimentTypes()
    this.getProteins()
    this.getContainerTypes()
    this.getUsers()
    this.getProcessingPipelines()

  },
  methods: {
    async  getProteins() {
      this.proteinsCollection = new DistinctProteins()
      this.gProteinsCollection = new DistinctProteins()
      // If we want to only allow valid samples
      if (app.options.get('valid_components') && !app.staff) {
        this.proteinsCollection.queryParams.external = 1
      }

      const result = await this.$store.dispatch('getCollection', this.proteinsCollection)
      this.proteins = result.toJSON()
      this.proteinsLoaded = true
    },
    async getContainerTypes() {
      // Get the geometry for this container type
      // When backend can get container type by name or id we can make this more efficient
      let containerTypesCollection = new ContainerTypes()
      const result = await this.$store.dispatch('getCollection', containerTypesCollection)
      let containerTypeModel = result.findWhere({NAME: this.container.CONTAINERTYPE})

      if (containerTypeModel) {
        this.containerType = Object.assign(INITIAL_CONTAINER_TYPE, containerTypeModel.toJSON())
      }
    },
    // Callback from pagination
    onUpdateHistory(payload) {
      let collection = new ContainerHistory( null, {state: { pageSize: payload.pageSize, currentPage: payload.currentPage}})
      this.getHistory(collection)
    },
    // Effectively a patch request to update specific fields
    async save(parameter) {
      let params = {}
      params[parameter] = this.container[parameter]

      await this.$store.dispatch('saveModel', { model: this.containerModel, attributes: params })
    },
    async getHistory() {
      let collection = new ContainerHistory()

      // Make sure we are getting history for this container
      collection.queryParams.cid = this.containerId
      // Fetch the history and content for this container
      const history = await this.$store.dispatch('getCollection', collection)
      this.containerHistory = history.toJSON()
      this.containerHistoryTotal = history.state.totalRecords
    },
    async getSamples(collection) {
      const result = await this.$store.dispatch('getCollection', collection)

      if (result) {
        this.resetSamples(this.container.CAPACITY)
      }
    },
    async getExperimentTypes() {
      let experimentTypesCollection = new ExperimentTypes()

      const result = await this.$store.dispatch('getCollection', experimentTypesCollection)
      let experimentType = this.findExperimentType(result)

      this.experimentKind = experimentType.length > 0 ? experimentType[0].EXPERIMENTTYPEID : 0

    },
    findExperimentType(collection) {
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
    resetSamples(capacity) {
      this.$store.commit('samples/reset', capacity)

      this.samplesCollection.each( s => {
        let i = +(s.get('LOCATION')) - 1
        this.$store.commit('samples/setSample', {index: i, data: s.toJSON()})
      })
    },
    onContainerCellClicked: function(location) {
      EventBus.$emit('select-sample', location)
    }
  },
  provide() {
    return {
      $spaceGroups: this.spaceGroups,
      $centeringMethods: this.centeringMethods,
      $anomalousList: this.anomalousList,
      $experimentKindList: this.experimentKindList,
      $showUDCColumns: () => this.showUDCColumns,
      $sampleLocation: () => this.sampleLocation,
      $sampleGroups: () => this.sampleGroups
    }
  }
}
</script>
<style scoped>
.top-5 {
  top: -5px;
}
</style>