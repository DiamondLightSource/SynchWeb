<template>
  <div class="content">
    <!-- <h1 data-testid="container-header">Container {{container.NAME}}</h1> -->
    <page-title-header
      prevNextPathPrefix="/containers/cid/"
      :prevNextTargets="this.prevNextTargetLinks"
      :currentValue="this.containerId"
    >
      Container {{container.NAME }}
    </page-title-header>

    <p class="help">
      This page shows the contents of the selected container. Samples can be added and edited by clicking the pencil icon, and removed by clicking the x
    </p>

    <p
      v-if="container.CONTAINERSTATUS === 'processing'"
      class="message alert"
    >
      This container is currently assigned and in use on a beamline sample changer. Unassign it to make it editable
    </p>

    <validation-observer
      ref="containerForm"
      v-slot="{ invalid, errors }"
    >
      <div class="tw-flex puck_wrap">
        <div class="form vform tw-w-2/3">
          <ul>
            <li>
              <span class="label">Name</span>
              <base-input-text
                v-model="container.NAME"
                :inline="true"
                @save="save('NAME')"
              />
            </li>

            <li>
              <span class="label">Shipment</span>
              <span><a
                class="tw-underline"
                :href="'/shipments/sid/'+container.SHIPPINGID"
              >{{ container.SHIPMENT }}</a></span>
            </li>

            <li>
              <span class="label">Dewar</span>
              <span>{{ container.DEWAR }}</span>
            </li>
            <li>
              <span class="label">Container Type</span>
              <span>{{ container.CONTAINERTYPE }}</span>
            </li>
            <li>
              <span class="label">Owner</span>
              <base-input-select
                v-model="container.OWNER"
                :options="users"
                option-value-key="PERSONID"
                :inline="true"
                option-text-key="FULLNAME"
                @save="save('OWNERID')"
              />
            </li>
            <li
              v-if="isPuck"
              class="tw-flex tw-flex-row tw-w-full"
            >
              <span class="label">Registered Container</span>
              <base-input-select
                v-model="container.CONTAINERREGISTRYID"
                :initial-text="container.REGISTRY ? container.REGISTRY : 'Select From Registry'"
                name="CONTAINERREGISTRYID"
                :options="containerRegistry"
                :inline="true"
                option-value-key="CONTAINERREGISTRYID"
                option-text-key="BARCODE"
                @save="save('CONTAINERREGISTRYID')"
              />
              <span class="tw-relative"><router-link
                :to="`/containers/registry/${container.CONTAINERREGISTRYID}`"
                class="tw-absolute top-5 tw-text-content-page-color"
              >[View]</router-link></span>
            </li>
            <li>
              <span class="label">Barcode</span>
              <base-input-text
                v-model="container.BARCODE"
                :inline="true"
                initial-text="Click to edit"
                @save="save('BARCODE')"
              />
            </li>
            <li v-if="container.PIPELINE">
              <span class="label">Priority Processing</span>
              <base-input-select
                v-model="container.PIPELINE"
                name="PIPELINE"
                :options="processingPipelines"
                option-value-key="PROCESSINGPIPELINEID"
                :inline="true"
                option-text-key="NAME"
              />
            </li>

            <li>
              <span class="label">Automated Collection</span>
              <span v-if="containerQueueId">
                This container was queued for auto collection on {{ container['QUEUEDTIMESTAMP'] }}
                <a
                  class="tw-cursor-pointer button unqueue"
                  @click="onUnQueueContainer"
                ><i class="fa fa-times" /> Unqueue</a>
              </span>
              <span v-else-if="shippingSafetyLevel === null">
                Cannot queue container until shipment safety level is set
              </span>
              <span v-else-if="shippingSafetyLevel != 'Green'">
                Cannot queue containers in {{ shippingSafetyLevel }} shipments
              </span>
              <span v-else-if="containerQueueError">
                There was an error submitting the container to the queue. Please fix any errors in the samples table.
                <a
                  class="tw-cursor-pointer button tryagainqueue"
                  @click="onTryAgainQueueContainer"
                ><i class="fa fa-check" /> Try again</a>
                <a
                  class="tw-cursor-pointer button cancelqueue"
                  @click="onCancelQueueContainer"
                ><i class="fa fa-times" /> Cancel</a>
              </span>
              <span v-else>
                <a
                  class="tw-cursor-pointer button queue"
                  @click="onQueueContainer"
                ><i class="fa fa-plus" /> Queue</a> this container for Auto Collect
              </span>
            </li>

            <li>
              <span class="label">Comments</span>
              <base-input-text
                v-model="container.COMMENTS"
                :inline="true"
                inline-text="Click to edit"
                @save="save('COMMENTS')"
              />
            </li>

            <li class="clearfix">
              <span class="label">Location History</span>
              <div class="history tw-inline-block tw-w-2/3">
                <table-component
                  :headers="containerHistoryHeaders"
                  :data="containerHistory"
                  no-data-text="No history available"
                />
                <pagination-component @page-changed="onUpdateHistory" />
              </div>
            </li>
          </ul>
        </div> <!-- End Container Form Elements -->

        <div
          class="puck tw-w-2/3"
          title="Click to jump to a position in the puck"
        >
          <valid-container-graphic
            class="tw-border-l tw-border-gray-500"
            :container-type="containerType"
            :samples="samples"
            :valid-samples="validSamples"
            @cell-clicked="onContainerCellClicked"
          />
        </div>
      </div> <!-- End flex puck wrap-->

      <div class="table sample">
        <component
          :is="sampleComponent"
          ref="samples"
          :container-id="containerId"
          :invalid="invalid"
          :currentlyEditingRow="editingSampleLocation"
          :disableUpdateSamples="disableUpdateSamples"
          @update-editing-row="updateEditingSampleLocation"
          @save-sample="onSaveSample"
          @clone-sample="onCloneSample"
          @clear-sample="onClearSample"
          @clone-container="onCloneContainer"
          @clear-container="onClearContainer"
          @clone-container-column="onCloneColumn"
          @clone-container-row="onCloneRow"
          @bulk-update-samples="onUpdateSamples"
          @disable-update-samples="disableUpdateSamples"
          @update-samples-with-sample-group="handleSampleFieldChangeWithSampleGroups"
          @save-sample-move="saveSampleMove"
        />
      </div>

      <div
        v-show="invalid"
        class="tw-w-full tw-bg-red-200 tw-border tw-border-red-500 tw-rounded tw-p-1 tw-mb-4"
      >
        <p class="tw-font-bold">
          Please fix the errors on the form
        </p>
        <div
          v-for="(error, index) in errors"
          :key="index"
        >
          <p
            v-show="error.length > 0"
            class="tw-black"
          >
            {{ error[0] }}
          </p>
        </div>
      </div>
    </validation-observer>

    <portal to="dialog">
      <custom-dialog-box
        v-if="displayQueueModal"
        @perform-modal-action="performModalAction(modal[currentModal].actions.confirm)"
        @close-modal-action="closeModalAction(modal[currentModal].actions.cancel)"
      >
        <template>
          <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
            <p>Queue Container?</p>
            <button
              class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
              @click="closeModalAction(modal[currentModal].actions.cancel)"
            >
              <i class="fa fa-times" />
            </button>
          </div>
          <div
            class="tw-py-3 tw-px-4"
            v-html="modal[currentModal].message"
          />
        </template>
      </custom-dialog-box>
    </portal>
  </div>
</template>

<script>
import formatDate from 'date-fns-tz/format'
import { ValidationObserver, ValidationProvider }  from 'vee-validate'

import ContainerHistory from 'modules/shipment/collections/containerhistory'
import Samples from 'collections/samples'
import Shipments from 'collections/shipments'
import Containers from 'collections/containers'
import Dewars from 'collections/dewars'

import PrevNextBtngroup from 'app/components/prev-next-btngroup.vue'
import PageTitleHeader from 'app/components/page-title-header.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import ContainerMixin from 'modules/types/mx/shipment/views/container-mixin'
import CustomDialogBox from 'js/app/components/custom-dialog-box.vue'
import PaginationComponent from 'app/components/pagination.vue'
import SingleSample from 'modules/types/mx/samples/single-sample.vue'
import MxPuckSamplesTable from 'modules/types/mx/samples/mx-puck-samples-table.vue'
import TableComponent from 'app/components/table.vue'
import ValidContainerGraphic from 'modules/types/mx/samples/valid-container-graphic.vue'

export default {
  name: 'MxContainerView',
  components: {
    'prev-next-btngroup': PrevNextBtngroup,
    'page-title-header': PageTitleHeader,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-select': BaseInputSelect,
    'valid-container-graphic': ValidContainerGraphic,
    'table-component': TableComponent,
    'pagination-component': PaginationComponent,
    'custom-dialog-box': CustomDialogBox,
    'single-sample-plate': SingleSample,
    'mx-puck-samples-table': MxPuckSamplesTable,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider,
  },
  mixins: [ContainerMixin],
  props: {
    containerModel: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      container: {},
      containerId: 0,
      siblingContainers: {}, // All containers using this Dewar and shippingID
      samplesCollection: null,

      containerHistory: [],
      containerHistoryHeaders: [
        {key: 'BLTIMESTAMP', title: 'Date'},
        {key: 'STATUS', title: 'Status'},
        {key: 'LOCATION', title: 'Location'},
        {key: 'BEAMLINELOCATION', title: 'Beamline'}
      ],
      containerHistoryTotal: 0,
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
          message: `<p>Are you sure you want to remove this container from the queue? You will lose your current place</p>`
        }
      },
      currentModal: 'queueContainer',
      containerQueueId: null,
      QUEUEFORUDC: null,
      containerQueueError: null,
      autoCollectMessage: '',
      sampleLocation: 0,

      containers: [],
      containersCollection: null,
      shipments: [],
      shipmentsCollection: null,
      dewars: [],
      dewarsCollection: null,
      selectedDewarId: null,
      selectedShipmentId: null,
      shippingSafetyLevel: null,
      editingSampleLocation: null
    }
  },
  computed: {
    containersSamplesGroupData() {
      return this.$store.getters['samples/getContainerSamplesGroupData']
    },
    prevNextTargetLinks() {
      return _.chain(this.siblingContainers)
      .map(sib => ({ value: sib.CONTAINERID, text: sib.NAME }))
      .sortBy((c) => c.text)
      .value();
    },
  },
  created: function() {
    // Get samples for this container id
    this.fetchShipments()
    this.loadContainerData()
    this.loadSampleGroupInformation()
    this.getGlobalProteins()
    this.getProteins()
    this.getContainerRegistry()
    this.getHistory()
    this.getContainerTypes()
    this.getUsers()
    this.getProcessingPipelines()
    this.formatExperimentKindList()
    this.getSpaceGroupsCollection()
    this.getImagingCollections()
    this.getImagingScheduleCollections()
    this.getImagingScreensCollections()

  },
  beforeMount: function(){
    this.fetchSiblingContainers();
  },
  methods: {
    loadContainerData() {
      this.container = Object.assign({}, this.containerModel.toJSON())
      this.containerId = this.containerModel.get('CONTAINERID')
      this.shippingSafetyLevel = this.containerModel.get('SHIPPINGSAFETYLEVEL')
      this.containerQueueId = this.containerModel.get('CONTAINERQUEUEID')
      if (this.containerQueueId) this.QUEUEFORUDC = true
    },
    async loadSampleGroupInformation() {
      await this.getSampleGroups()

      this.samplesCollection = new Samples(null, { state: { pageSize: 9999 } })
      this.samplesCollection.queryParams.cid = this.containerId
      await this.getSamples(this.samplesCollection)
    },
    // Callback from pagination
    onUpdateHistory(payload) {
      let collection = new ContainerHistory(null, {
        state: {
          pageSize: payload.pageSize,
          currentPage: payload.currentPage
        }
      })
      this.getHistory(collection)
    },
    // Effectively a patch request to update specific fields
    async save(parameter) {
      let params = {}
      params[parameter] = this.container[parameter]

      await this.$store.dispatch('saveModel', { model: this.containerModel, attributes: params })
      this.$store.commit('notifications/addNotification', {
        title: 'Success:',
        message: 'Container has been successfully updated',
        level: 'success'
      })
      await this.$store.dispatch('getModel', this.containerModel)
      this.loadContainerData()
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
        await this.resetSamples(this.container.CAPACITY)
      }
    },
    // Reset Backbone Samples Collection
    async resetSamples(capacity) {
      const samples = this.samplesCollection.toJSON()

      for (let sample of samples) {
        let status = '';
        // Setting the status of the sample based on one of the following values
        const statusList = ['R', 'SC', 'AI', 'GR', 'ES', 'XM', 'XS', 'DC', 'AP']
        statusList.forEach(t => {
          if (Number(sample[t]) > 0) status = t
        })
        sample['STATUS'] = status
        sample.VALID = 1
      }
      this.$store.commit('samples/setAllSamples', {capacity, samples})

      this.$nextTick(() => {
        this.$refs.containerForm.reset()
      })
    },
    onContainerCellClicked: function (location) {
      this.sampleLocation = location - 1
    },
    onQueueContainer() {
      this.QUEUEFORUDC = true
      this.currentModal = 'queueContainer'
      this.displayQueueModal = true
    },
    onTryAgainQueueContainer() {
      this.currentModal = 'queueContainer'
      this.displayQueueModal = true
    },
    onCancelQueueContainer() {
      this.QUEUEFORUDC = false
      this.containerQueueError = false
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
        const validated = await this.$refs.containerForm.validate()
        if(!validated){
          this.containerQueueError = true
          this.$store.commit('notifications/addNotification', {
            title: 'Error',
            message: 'Unable to add container to UDC queue, please check fields in sample table',
            level: 'error'
          })
          return
        }
        this.containerQueueError = false
        const response = await this.toggleContainerQueue(true, this.containerId)
        this.$emit('update-container-state', {
          CONTAINERQUEUEID: response.get('CONTAINERQUEUEID'),
          QUEUEDTIMESTAMP: formatDate(new Date(), 'dd-MM-yyyy HH:mm')
        })
        this.$nextTick(() => {
          this.loadContainerData()
          this.getProteins()
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
        this.QUEUEFORUDC = false
        this.displayQueueModal = false
        await this.toggleContainerQueue(false, this.containerId)
        this.$emit('update-container-state', { CONTAINERQUEUEID: null })
        this.$nextTick(() => {
          this.loadContainerData()
          this.getProteins()
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

    /**
     * Fetch any other containers sharing the same Dewar & shipment, sorted by NAME.
     * Also tracks the index of the current Container
     */
    async fetchSiblingContainers() {
      var result;

      if (this.containersCollection?.length>0) {
        // ! if ContainersCollection exists then filter it instead rather than re-fetching.
        // !! WARNING -  THis assumes that containersCollection has ALL containers of the dewar
        result = _.filter(this.containersCollection,  (c) => 
          c.DEWARID === this.container.DEWARID
        );

      } else {
        result = new Containers();
        result.dewarID = this.container.DEWARID;
        await result.fetch();
      }

      this.siblingContainers = result.toJSON();
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
    },
    async onUpdateSamples() {
      this.disableUpdateSamples = true
      const containerId = this.containerId
      this.containerId = null
      await this.$nextTick()
      const validated = await this.$refs.containerForm.validate()

      this.containerId = containerId

      if (validated) {
        await this.$store.dispatch('samples/update', this.containerId)
        await this.loadSampleGroupInformation()
        await this.$store.commit('notifications/addNotification', {
          title: 'Samples Updated',
          message: 'Sample(s) have been successfully updated',
          level: 'success'
        })
        this.$refs.containerForm.reset()
      } else {
        await this.$store.commit('notifications/addNotification', {
          title: 'Error:',
          message: 'Sample(s) have not been updated, please see the errors at the bottom of the page.',
          level: 'error'
        })
      }
      this.disableUpdateSamples = false
    },
    updateEditingSampleLocation(value) {
      this.editingSampleLocation = value
    },
    async saveSampleMove(data) {
      try {
        this.$store.commit('loading', true)
        await this.$store.dispatch('saveDataToApi', {
          url: `/sample/move/${data['BLSAMPLEID']}`,
          data,
          requestType: 'moving sample to another container'
        })

        await this.loadSampleGroupInformation()
        this.$refs.containerForm.reset()
      } finally {
        this.$store.commit('loading', false)
      }
    }
  }
}
</script>
<style scoped>
.top-5 {
  top: -5px;
}
</style>
