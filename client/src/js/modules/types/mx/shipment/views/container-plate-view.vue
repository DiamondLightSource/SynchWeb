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
            <span v-if="containerQueueId">
              This container was queued for auto collection on {{container['QUEUEDTIMESTAMP']}}
              <a @click="onUnQueueContainer" class="tw-cursor-pointer button unqueue"><i class="fa fa-times"></i> Unqueue</a>
            </span>
            <span v-else>
              <a @click="onQueueContainer" class="tw-cursor-pointer button queue"><i class="fa fa-plus"></i> Queue</a> this container for Auto Collect
            </span>
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

    <portal to="dialog">
      <dialog-box
        v-if="displayQueueModal"
        @perform-modal-action="performModalAction(modal[currentModal].actions.confirm)"
        @close-modal-action="closeModalAction(modal[currentModal].actions.cancel)">
        <template>
          <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
            <p>Queue Container?</p>
            <button
              class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
              @click="closeModalAction(modal[currentModal].actions.cancel)">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="tw-py-3 tw-px-4" v-html="modal[currentModal].message"></div>
        </template>
      </dialog-box>
    </portal>

  </div>
</template>

<script>
import ContainerHistory from 'modules/shipment/collections/containerhistory'
import ContainerTypes from 'modules/shipment/collections/containertypes'
import DistinctProteins from 'modules/shipment/collections/distinctproteins'
import ExperimentTypes from 'modules/shipment/collections/experimenttypes'
import Samples from 'collections/samples'
import Shipments from 'collections/shipments'
import Containers from 'collections/containers'
import Dewars from 'collections/dewars'
import SampleEditor from 'modules/types/mx/samples/sample-editor.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputCheckBox from 'app/components/base-input-checkbox.vue'

import ValidContainerGraphic from 'modules/types/mx/samples/valid-container-graphic.vue'
import TableComponent from 'app/components/table.vue'
import PaginationComponent from 'app/components/pagination.vue'
import ContainerMixin from 'modules/types/mx/shipment/views/container-mixin'
import Dialog from 'app/components/dialogbox.vue'
import formatDate from 'date-fns-tz/format'

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
    'base-input-checkbox': BaseInputCheckBox,
    'dialog-box': Dialog
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
      plateKey: 0,
      displayQueueModal: false,
      modal: {
        queueContainer: {
          actions: {
            cancel: 'closeModal',
            confirm: 'queueContainer'
          },
          message: `<p>Are you sure you want to queue this container for auto collection?</p>`
        },
        unQueueContainer: {
          actions: {
            cancel: 'closeModal',
            confirm: 'unQueueContainer'
          },
          message: `<p>Are you sure you want to remove this container from the queue? You will loose your current place</p>`
        }
      },
      currentModal: 'queueContainer',
      containerQueueId: null,
      autoCollectMessage: '',
      sampleLocation: 0,

      containers: [],
      containersCollection: null,
      shipments: [],
      shipmentsCollection: null,
      dewars: [],
      dewarsCollection: null,
      selectedDewarId: null,
      selectedShipmentId: null
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
    ...mapGetters({
      samples: ['samples/samples'],
    }),
    containersSamplesGroupData() {
      return this.$store.getters['samples/getContainerSamplesGroupData']
    }
  },
  created: function() {
    // Get samples for this container id
    this.loadContainerData()
    this.samplesCollection = new Samples()
    this.samplesCollection.queryParams.cid = this.containerId
    this.getSamples(this.samplesCollection)
    this.getHistory()
    this.getExperimentTypes()
    this.getProteins()
    this.getContainerTypes()
    this.getUsers()
    this.getProcessingPipelines()
    this.getSampleGroups()
    this.fetchShipments()
  },
  methods: {
    loadContainerData() {
      this.container = Object.assign({}, this.containerModel.toJSON())
      this.containerId = this.containerModel.get('CONTAINERID')
      this.containerQueueId = this.containerModel.get('CONTAINERQUEUEID')
    },
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
      this.sampleLocation = location - 1
    },
    onQueueContainer() {
      this.currentModal = 'queueContainer'
      this.displayQueueModal = true
    },
    onUnQueueContainer() {
      this.currentModal = 'unQueueContainer'
      this.displayQueueModal = true
    },
    // This method is used to trigger the action we want to carry out when the modal confirmation button is clicked
    performModalAction(selectedModalAction) {
      this[selectedModalAction]()
    },
    // This method is used to trigger the action we want to carry out when the modal close button is clicked
    closeModalAction(selectedModalAction) {
      this[selectedModalAction]()
    },
    closeModal() {
      this.displayQueueModal = false
    },
    async queueContainer() {
      try {
        this.displayQueueModal = false
        const response = await this.$store.dispatch('shipment/queueContainer', { CONTAINERID: this.containerId })
        this.$emit('update-container-state', {
          CONTAINERQUEUEID: response.CONTAINERQUEUEID,
          QUEUEDTIMESTAMP: formatDate(new Date(), 'dd-MM-yyyy HH:mm')
        })
        this.$nextTick(() => {
          this.loadContainerData()
          // TODO: Toggle Auto in the samples table
        })
      } catch (error) {
        this.$store.commit('notifications/addNotification', {
          title: 'Error',
          message: error.message,
          level: 'error'
        })
      } finally {
        // TODO: Toggle loading state off
      }
    },
    async unQueueContainer() {
      try {
        this.displayQueueModal = false
        const response = await this.$store.dispatch('shipment/unQueueContainer', { CONTAINERID: this.containerId })
        this.$emit('update-container-state', { CONTAINERQUEUEID: null })
        this.$nextTick(() => {
          this.loadContainerData()
          // TODO: Toggle Auto in the samples table
        })
      } catch (error) {
        this.$store.commit('notifications/addNotification', {
          title: 'Error',
          message: error.message,
          level: 'error'
        })
      } finally {
        // TODO: Toggle loading state off
      }
    },
    async fetchContainers() {
      this.containersCollection = new Containers(null, { state: { pageSize: 9999 } })
      this.containersCollection.queryParams.did = this.containersSamplesGroupData.dewarId

      const result = await this.$store.dispatch('getCollection', this.containersCollection)
      this.containers = result.toJSON().map((container, index) => ({
        value: container.CONTAINERID,
        text: container.NAME
      }))
    },
    async fetchDewars() {
      this.dewarsCollection = new Dewars(null, { state: { pageSize: 9999 } })
      this.dewarsCollection.queryParams.sid = this.containersSamplesGroupData.shipmentId

      const result = await this.$store.dispatch('getCollection', this.dewarsCollection)
      this.dewars = result.toJSON().map((dewar, index) => ({
        value: dewar.DEWARID,
        text: dewar.CODE
      }))
    },
    async fetchShipments() {
      this.shipmentsCollection = new Shipments(null, { state: { pageSize: 9999 } })

      const result = await this.$store.dispatch('getCollection', this.shipmentsCollection)
      this.shipments = result.toJSON().map((shipment, index) => ({
        value: shipment.SHIPPINGID,
        text: shipment.SHIPPINGNAME
      }))
    },
    async updateContainerSampleGroupsData(newData, oldData) {
      if (newData.shipmentId !== null) {
        await this.fetchDewars()
      }

      if (newData.dewarId !== null) {
        await this.fetchContainers()
      }
    }
  },
  watch: {
    containersSamplesGroupData(newValues, oldValues) {
      this.updateContainerSampleGroupsData(newValues, oldValues)
    }
  },
  provide() {
    return {
      $shipments: () => this.shipments,
      $dewars: () => this.dewars,
      $containers: () => this.containers
    }
  }
}
</script>
<style scoped>
.top-5 {
  top: -5px;
}
</style>