<template>
  <div class="content">
    <h1>Container {{container.NAME}}</h1>

    <p class="help">This page shows the contents of the selected container. Samples can be added and edited by clicking the pencil icon, and removed by clicking the x</p>

    <p v-if="container.CONTAINERSTATUS === 'processing'" class="message alert">This container is currently assigned and in use on a beamline sample changer. Unassign it to make it editable</p>

    <validation-observer ref="containerForm" v-slot="{ invalid, errors }">
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
            <li v-if="isPuck">
              <span class="label">Registered Container</span>
              <span class="tw-relative">{{container.REGISTRY}} <router-link :to="`/containers/registry/${container.CONTAINERREGISTRYID}`" class="tw-absolute top-5 tw-text-content-page-color" >[View]</router-link></span>
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
            :samples="samples"
            @cell-clicked="onContainerCellClicked"/>
        </div>

      </div> <!-- End flex puck wrap-->

      <div class="table sample">
        <component
          :is="sampleComponent"
          :containerId="container.CONTAINERID"
          @save-sample="onSaveSample"
          @clone-sample="onCloneSample"
          @clear-sample="onClearSample"
          @clone-container="onCloneContainer"
          @clear-container="onClearContainer"
          @clone-container-column="onCloneColumn"
          @clone-container-row="onCloneRow"
        />
      </div>

      <div class="tw-w-full tw-bg-red-200 tw-border tw-border-red-500 tw-rounded tw-p-1 tw-mb-4" v-show="invalid">
        <p class="tw-font-bold">Please fix the errors on the form</p>
        <div v-for="(error, index) in errors" :key="index">
          <p v-show="error.length > 0" class="tw-black">{{error[0]}}</p>
        </div>
      </div>
    </validation-observer>

    <portal to="dialog">
      <custom-dialog-box
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
      </custom-dialog-box>
    </portal>
  </div>
</template>

<script>
import formatDate from 'date-fns-tz/format'
import { ValidationObserver }  from 'vee-validate'

import ContainerHistory from 'modules/shipment/collections/containerhistory'
import ExperimentTypes from 'modules/shipment/collections/experimenttypes'
import Samples from 'collections/samples'
import Shipments from 'collections/shipments'
import Containers from 'collections/containers'
import Dewars from 'collections/dewars'

import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import ContainerMixin from 'modules/types/mx/shipment/views/container-mixin'
import CustomDialogBox from 'js/app/components/custom-dialog-box.vue'
import PaginationComponent from 'app/components/pagination.vue'
import SingleSample from 'modules/types/mx/samples/single-sample.vue'
import SamplePlate from 'modules/types/mx/samples/samples-plate.vue'
import TableComponent from 'app/components/table.vue'
import ValidContainerGraphic from 'modules/types/mx/samples/valid-container-graphic.vue'


export default {
  name: 'mx-container-view',
  mixins: [ContainerMixin],
  components: {
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-select': BaseInputSelect,
    'valid-container-graphic': ValidContainerGraphic,
    'table-component': TableComponent,
    'pagination-component': PaginationComponent,
    'custom-dialog-box': CustomDialogBox,
    'single-sample-plate': SingleSample,
    'mx-sample-plate': SamplePlate,
    'validation-observer': ValidationObserver,
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
    containersSamplesGroupData() {
      return this.$store.getters['samples/getContainerSamplesGroupData']
    },
    sampleComponent() {
      // Use a table editor unless capacity > 25
      // If we have been passed a valid container id then we are editing the samples, else new table

      return this.containerType.CAPACITY > 25 ? 'single-sample-plate' : 'mx-sample-plate'
    },
  },
  created: function() {
    // Get samples for this container id
    this.fetchShipments()
    this.loadContainerData()
    this.samplesCollection = new Samples(null, { state: { pageSize: 9999 } })
    this.samplesCollection.queryParams.cid = this.containerId
    this.getSamples(this.samplesCollection)
    this.getProteins()
    this.getHistory()
    this.getExperimentTypes()
    this.getContainerTypes()
    this.getUsers()
    this.getProcessingPipelines()
    this.formatExperimentKindList()
    this.getSampleGroups()
    this.fetchSampleGroupSamples()
    this.getSpaceGroupsCollection()
    this.getImagingCollections()
    this.getImagingScheduleCollections()
    this.getImagingScreensCollections()
  },
  methods: {
    loadContainerData() {
      this.container = Object.assign({}, this.containerModel.toJSON())
      this.containerId = this.containerModel.get('CONTAINERID')
      this.containerQueueId = this.containerModel.get('CONTAINERQUEUEID')
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
        if (type.NAME === this.container.EXPERIMENTTYPE && type.PROPOSALTYPE === proposalType) return true
      })
      // Try to find the experiment Type ID from all experiment types
      if (!filteredTypes) {
        filteredTypes = experimentTypes.filter( (type) => {
          if (type.NAME === this.container.EXPERIMENTTYPE) return true
        })
      }
      return filteredTypes
    },
    // Reset Backbone Samples Collection
    resetSamples(capacity) {
      this.$store.commit('samples/reset', capacity)

      this.samplesCollection.each( s => {
        this.$store.commit('samples/setSample', {
          index: Number(s.get('LOCATION')) - 1,
          data: { ...s.toJSON(), VALID: 1 }
        })
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
        await this.$store.dispatch('shipment/unQueueContainer', { CONTAINERID: this.containerId })
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
      this.containers = result.toJSON().map(container => ({
        value: container.CONTAINERID,
        text: container.NAME
      }))
    },
    async fetchDewars() {
      this.dewarsCollection = new Dewars(null, { state: { pageSize: 9999 } })
      this.dewarsCollection.queryParams.sid = this.containersSamplesGroupData.shipmentId

      const result = await this.$store.dispatch('getCollection', this.dewarsCollection)
      this.dewars = result.toJSON().map(dewar => ({
        value: dewar.DEWARID,
        text: dewar.CODE
      }))
    },
    async fetchShipments() {
      this.shipmentsCollection = new Shipments(null, { state: { pageSize: 9999 } })

      const result = await this.$store.dispatch('getCollection', this.shipmentsCollection)
      this.shipments = result.toJSON().map(shipment => ({
        value: shipment.SHIPPINGID,
        text: shipment.SHIPPINGNAME
      }))
    },
    async updateContainerSampleGroupsData(newData) {
      if (newData.shipmentId !== null) {
        await this.fetchDewars()
      }

      if (newData.dewarId !== null) {
        await this.fetchContainers()
      }
    }
  },
  watch: {
    containersSamplesGroupData(newValues) {
      this.updateContainerSampleGroupsData(newValues)
    },
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