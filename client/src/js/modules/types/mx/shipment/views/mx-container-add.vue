<template>
  <div class="content">
    <h1>Add Container</h1>

    <div class="tw-flex tw-flex-col">
      <!-- Wrap the form in an observer component so we can check validation state on submission -->
      <validation-observer
        ref="containerForm"
        v-slot="{ invalid, errors }"
      >
        <!-- Old Add containers had an assign button here - try leaving it out as there is a menu item for /assign -->
        <form
          id="add_container"
          class="tw-flex"
          method="post"
          @submit.prevent="onSubmit"
        >
          <!-- Left hand side is form controls -->
          <div class="form tw-w-1/2">
            <div class="tw-mb-2 tw-py-2">
              <span class="label">Shipment</span>
              <span><a
                class="tw-underline"
                :href="'/shipments/sid/'+dewar.SHIPPINGID"
              >{{ dewar.SHIPPINGNAME }}</a></span>
            </div>

            <div class="tw-mb-2 tw-py-2">
              <span class="label">Dewar</span>
              <span>{{ dewar.CODE }}</span>
            </div>

            <div class="tw-mb-2 tw-py-2">
              <base-input-groupselect
                v-model="CONTAINERTYPEID"
                label="Container Type"
                :groups="groupedContainerTypes"
                option-value-key="CONTAINERTYPEID"
                option-text-key="NAME"
                default-text="Please select a container type"
              />
            </div>

            <div v-show="plateType === 'puck'">
              <base-input-select
                v-model="CONTAINERREGISTRYID"
                outer-class="tw-mb-2 tw-py-2"
                label="Registered Container"
                name="CONTAINERREGISTRYID"
                :options="containerRegistry"
                option-value-key="CONTAINERREGISTRYID"
                option-text-key="BARCODE"
              />

              <validation-provider
                v-slot="{ errors }"
                tag="div"
                class="tw-mb-2 tw-py-2"
                rules="required"
                name="Container Name"
                vid="container-name"
              >
                <base-input-text
                  v-model="NAME"
                  label="Container Name"
                  :error-message="errors[0]"
                />
              </validation-provider>

              <base-input-select
                v-model="PROCESSINGPIPELINEID"
                outer-class="autoprocessing_options tw-mb-2 tw-py-2"
                label="Priority Processing"
                description="Other data reduction pipelines will run on a lower priority queue"
                name="PIPELINE"
                :options="processingPipelines"
                option-value-key="PROCESSINGPIPELINEID"
                option-text-key="NAME"
              />

              <div class="tw-mb-2 tw-py-2">
                <label>Show all space groups</label>
                <base-input-checkbox
                  v-model="SPACEGROUP"
                  name="SHOW SPACEGROUP"
                />
              </div>

              <div class="tw-mb-2 tw-py-2">
                <label>Queue For UDC</label>
                <base-input-checkbox
                  v-model="QUEUEFORUDC"
                  name="Queue For UDC"
                />
              </div>
            </div>

            <div v-show="plateType === 'plate'">
              <div class="tw-flex tw-w-full tw-relative">
                <base-input-text
                  v-model="BARCODE"
                  outer-class="tw-mb-2 tw-py-2 tw-flex tw-flex-1"
                  label="Barcode"
                  name="Barcode"
                />
                <span
                  v-if="barcodeMessage"
                  class="barcode-message tw-text-xs tw-ml-4 tw-bg-content-light-background tw-rounded tw-p-2 tw-absolute"
                >{{ barcodeMessage }}</span>
              </div>

              <validation-provider
                v-slot="{ errors }"
                tag="div"
                class="tw-mb-2 tw-py-2"
                rules="required"
                name="Container Name"
                vid="container-name"
              >
                <base-input-text
                  v-model="NAME"
                  label="Container Name"
                  :error-message="errors[0]"
                />
              </validation-provider>

              <base-input-select
                v-model="REQUESTEDIMAGERID"
                outer-class="tw-mb-2 tw-py-2"
                label="Requested Imager"
                description="Imager this container should go into"
                name="REQUESTERIMAGER"
                :options="imagingImagers"
                option-value-key="IMAGERID"
                option-text-key="NAME"
              />

              <base-input-select
                v-model="SCHEDULEID"
                outer-class="tw-mb-2 tw-py-2"
                label="Imaging Schedule"
                description="Requested Imaging Schedule"
                name="IMAGING SCHEDULE"
                :options="imagingSchedules"
                option-value-key="SCHEDULEID"
                option-text-key="NAME"
              >
                <template #actions>
                  <a
                    href="#"
                    class="button view_sch tw-w-16 tw-text-center tw-h-6"
                    @click="viewSchedule"
                  ><i class="fa fa-search" /> View</a>
                </template>
              </base-input-select>

              <base-input-select
                v-model="SCREENID"
                outer-class="tw-mb-2 tw-py-2"
                label="Crystallisation Screen"
                description="Crystallisation screen that was used for this container"
                name="CRYSTALLISATION SCREEN"
                :options="imagingScreens"
                option-value-key="SCREENID"
                option-text-key="NAME"
              />
            </div>

            <div v-show="plateType === 'pcr'">
              <base-input-text
                v-model="BARCODE"
                outer-class="tw-mb-2 tw-py-2"
                label="Barcode"
                name="Barcode"
              />

              <validation-provider
                v-slot="{ errors }"
                tag="div"
                class="tw-mb-2 tw-py-2"
                rules="required"
                name="Container Name"
                vid="container-name"
              >
                <base-input-text
                  v-model="NAME"
                  label="Container Name"
                  :error-message="errors[0]"
                />
              </validation-provider>

              <base-input-select
                v-model="EXPERIMENTTYPEID"
                outer-class="tw-mb-2 tw-py-2"
                label="Experiment Type"
                name="EXPERIMENTTYPE"
                default-text="-"
                :options="experimentTypes"
                option-value-key="value"
                option-text-key="name"
              />

              <base-input-select
                v-model="STORAGETEMPERATURES"
                outer-class="tw-mb-2 tw-py-2"
                label="Experiment Type"
                name="STORAGETEMPERATURES"
                default-text="-"
                :options="storageTemperatures"
                option-value-key="value"
                option-text-key="name"
              />
            </div>

            <validation-provider
              tag="div"
              class="tw-mb-2 tw-py-2"
              rules="required"
              name="owner"
            >
              <base-input-select
                v-model="PERSONID"
                outer-class="tw-flex tw-w-full tw-items-center"
                label="Owner"
                description="This user will be emailed with container updates. Check your email is up to date!"
                name="PERSONID"
                :options="users"
                option-value-key="PERSONID"
                option-text-key="FULLNAME"
              >
                <template #error-msg>
                  <span
                    v-show="!ownerEmail"
                    class="emsg tw-bg-content-light-background tw-text-xxs tw-ml-1 tw-p-1 tw-h-6"
                  >Please update your email address by clicking view</span>
                </template>
                <template #actions>
                  <a
                    :href="`/contacts/user/${PERSONID}`"
                    class="button edit_user tw-w-16 tw-text-center tw-h-6 tw-text-xxs"
                  ><i class="fa fa-search" /> View</a>
                </template>
              </base-input-select>
            </validation-provider>

            <base-input-text
              id="comments"
              v-model="COMMENTS"
              outer-class="tw-mb-2 tw-py-2"
              name="COMMENTS"
              description="Comment for the container"
              label="Comments"
            />
          </div>

          <!-- Right hand side is container graphic -->
          <div class="tw-w-1/2">
            <div class="tw-justify-end">
              <valid-container-graphic
                ref="containerGraphic"
                :container-type="containerType"
                :samples="samples"
                :valid-samples="validSamples"
                @cell-clicked="onContainerCellClicked"
              />
            </div>
          </div>
        </form>

        <div>
          <!-- Sample specific fields -->
          <component
            :is="sampleComponent"
            ref="sampleEditor"
            @save-sample="onSaveSample"
            @clone-sample="onCloneSample"
            @clear-sample="onClearSample"
            @clone-container="onCloneContainer"
            @clear-container="onClearContainer"
            @clone-container-column="onCloneColumn"
            @clone-container-row="onCloneRow"
            @clear-container-column="onClearColumn"
            @clear-container-row="onClearRow"
            @update-sample-group-input-disabled="updateSampleGroupInputDisabled"
            @update-sample-group-list="getSampleGroups"
          />
        </div>
        <!--
          We can show the errors accumulated from the table here.
          The properties errors and invalid come from the validation observer.
          Each validation provider should provide a vid to key the error and a name for the error message.
        -->
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

        <div class="">
          <button
            name="submit"
            type="submit"
            :class="['button submit tw-text-base tw-px-4 tw-py-2', invalid ? 'tw-border tw-border-red-500 tw-bg-red-500': '']"
            @click.prevent="onSubmit"
          >
            <i class="fa fa-plus" />
            Add Container
          </button>
        </div>
      </validation-observer>
    </div>

    <portal to="dialog">
      <custom-dialog-box
        v-if="displayImagerScheduleModal"
        size="large"
        :hide-ok-button="true"
        @close-modal-action="closeModalAction"
      >
        <template>
          <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
            <p>View Schedule</p>
            <button
              class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
              @click="closeModalAction"
            >
              <i class="fa fa-times" />
            </button>
          </div>
          <div class="tw-py-3 tw-px-4 tw-border-b tw-border-content-border">
            <div class="tw-border-b tw-border-content-border">
              <h3 class="tw-text-2xl">
                Schedule for {{ selectedSchedule.NAME }}
              </h3>
            </div>

            <div class="tw-w-full">
              <table-component
                :data="imagingScheduleComponents"
                :headers="schedulingComponentHeader"
              />
            </div>
          </div>
        </template>
      </custom-dialog-box>
    </portal>
  </div>
</template>

<script>
import { ValidationObserver, ValidationProvider }  from 'vee-validate'
import { debounce } from 'lodash-es'
import Container from 'models/container'
import DistinctProteins from 'modules/shipment/collections/distinctproteins'

import ValidContainerGraphic from 'modules/types/mx/samples/valid-container-graphic.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputGroupSelect from 'app/components/base-input-groupselect.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import CustomDialogBox from 'js/app/components/custom-dialog-box.vue'
import TableComponent from 'app/components/table.vue'
import MxPuckSamplesTable from 'js/modules/types/mx/samples/mx-puck-samples-table.vue'
import SingleSample from 'modules/types/mx/samples/single-sample.vue'

import ContainerMixin from 'modules/types/mx/shipment/views/container-mixin'
import ContainerTypeUtils from 'app/utils/container-type.utils'


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
  name: 'MxAddContainer',
  components: {
    'base-input-groupselect': BaseInputGroupSelect,
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
    'valid-container-graphic': ValidContainerGraphic,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider,
    'custom-dialog-box': CustomDialogBox,
    'table-component': TableComponent,
    'single-sample-plate': SingleSample,
    'mx-puck-samples-table': MxPuckSamplesTable
  },
  mixins: [ContainerMixin],
  props: {
    'mview':[Function, Promise], // The marionette view could be lazy loaded or static import
    'breadcrumbs' : Array,
    'breadcrumb_tags' : Array, // These are model properties appended to the breadcrumbs title
    'options': Object, // In common with container add views, this options should include a dewar model
  },
  data() {
    return {
      // Container State
      DEWARID: "",
      BARCODECHECK: null,
      CAPACITY: 0,
      CONTAINERTYPE: null,
      CONTAINERTYPEID: "!",
      PROCESSINGPIPELINEID: null,
      NAME: "",
      CONTAINERREGISTRYID: null,
      AUTOMATED: 0,
      BARCODE: "",
      PERSONID: "",
      EXPERIMENTTYPE: "",
      COMMENTS: "",
      REQUESTEDIMAGERID: null,
      SCHEDULEID: null,
      SCREENID: null,
      EXPERIMENTTYPEID: null,
      QUEUEFORUDC: false,
      SPACEGROUP: false,
      STORAGETEMPERATURES: null,

      barcodeMessage: '',

      // The dewar that this container will belong to
      dewar: null,

      processingPipeline: '',
      processingPipelines: [],

      proteinCombo: '123540',
      proteinSelection: null,
      selectedSample: null,
      sampleLocation: 0,
      displayImagerScheduleModal: false,
      selectedSchedule: null,
      selectedScreen: null,
      schedulingComponentHeader: [
        {key: 'OFFSET_HOURS', title: 'Offset Hours'},
        {key: 'INSPECTIONTYPE', title: 'Imaging Type'},
      ],
      wellDrop: -1
    }
  },
  computed: {
    // This takes the containerTypes collection and groups the options based on the proposal type
    // It assumes that any proposal type listed in containerFilter should be included
    groupedContainerTypes: function() {
      let groups = []
      for (let i=0; i<this.containerFilter.length; i++) {
        // Find all containers with this proposal Type
        let proposalType = this.containerFilter[i]
        let containers = this.containerTypes.filter(container => container.PROPOSALTYPE === proposalType)
        groups.push({name: proposalType, options: containers})
      }
      return groups
    },
    ownerEmail: function() {
      // Does the selected owner have a valid email?
      if (!this.PERSONID) return false

      let owner = this.usersCollection.findWhere({PERSONID: this.PERSONID.toString()})

      return (owner && owner.get('EMAILADDRESS'))
    },
    containerGroup() {
      return this.$store.getters['proposal/currentProposalType']
    },
  },
  watch: {
    // When the container type changes we need to reset the samples list and redraw the container graphic
    CONTAINERTYPEID: {
      immediate: true,
      handler: function(newVal) {
        if (newVal) {
          let type = this.containerTypesCollection.findWhere({ CONTAINERTYPEID: newVal })

          if (!type) {
            return
          }
          this.CONTAINERTYPE = type.get('NAME')
          const nameToLower = this.CONTAINERTYPE.toLowerCase()
          this.containerType = Object.assign(INITIAL_CONTAINER_TYPE, type.toJSON())

          if (nameToLower.includes('puck')) {
            this.plateType = 'puck'
          } else if (nameToLower.includes('pcrstrip')) {
            this.plateType = 'pcr'
          } else {
            this.plateType = 'plate'
            this.containerTypeDetails = ContainerTypeUtils({
              capacity: this.containerType['CAPACITY'],
              dropHeight: this.containerType['DROPHEIGHT'],
              dropPerWellX: this.containerType['DROPPERWELLX'],
              dropPerWellY: this.containerType['DROPPERWELLY'],
              dropWidth: this.containerType['DROPWIDTH'],
              wellDrop: this.containerType['WELLDROP'],
              wellPerRow: this.containerType['WELLPERROW']
            })

          }

          this.resetSamples(type.get('CAPACITY'))
        }
      }
    },
    AUTOMATED: {
      immediate: true,
      handler: function(newVal) {
        const proteinsCollection = new DistinctProteins()
        // If now on, add safety level to query
        // Automated collections limited to GREEN Low risk samples
        if (newVal) {
          proteinsCollection.queryParams.SAFETYLEVEL = 'GREEN';
        } else {
          proteinsCollection.queryParams.SAFETYLEVEL = 'ALL';
        }
        this.$store.dispatch('getCollection', proteinsCollection).then( (result) => {
          this.proteins = result.toJSON()
        })
        app.trigger('samples:automated', newVal)
      }
    },
    CONTAINERREGISTRYID: {
      immediate: true,
      handler: function(newVal) {
        if (this.plateType === 'puck' && newVal) {
          // When a user selects a registered container we should update the name/barcode
          let entry = this.containerRegistry.find( item => item.CONTAINERREGISTRYID === newVal)
          this.NAME = entry['BARCODE'] || '-'
        }
      }
    },
    QUEUEFORUDC: {
      immediate: true,
      handler: function(newVal) {
        let samples
        if (newVal) {
          samples = this.samples.map(sample => {
            if (!sample.CENTRINGMETHOD) {
              sample.CENTRINGMETHOD = 'diffraction'
            }

            if (!sample.EXPERIMENTKIND) {
              sample.EXPERIMENTKIND = 'Ligand binding'
            }

            if (!sample.SCREENINGMETHOD) {
              sample.SCREENINGMETHOD = 'none'
            }

            return sample
          })

          this.AUTOMATED = 1
        } else {
          this.AUTOMATED = ''
        }

        this.$store.commit('samples/set', samples)
      }
    },
    SPACEGROUP: {
      immediate: true,
      handler: function() {
        this.getSpaceGroupsCollection()
      }
    },
    BARCODE: {
      handler: debounce(function() {
        this.checkContainerBarcode()
      }, 1000)
    },
    REQUESTEDIMAGERID: {
      handler: 'getUsers'
    },
    SCREENID: {
      handler: 'assignScreeningComponent'
    }
  },
  created: function() {
    this.containerType = INITIAL_CONTAINER_TYPE
    this.dewar = this.options.dewar.toJSON()
    this.DEWARID = this.dewar.DEWARID

    this.resetSamples(this.containerType.CAPACITY)

    this.getGlobalProteins()
    this.getProteins()
    this.getContainerTypes()
    this.getContainerRegistry()
    this.getProcessingPipelines()
    this.formatExperimentKindList()
    this.getSampleGroups()
    this.getUsers()
    this.fetchSampleGroupSamples()
    this.getSpaceGroupsCollection()
    this.getImagingCollections()
    this.getImagingScheduleCollections()
    this.getImagingScreensCollections()
  },
  methods: {
    // Called on Add Container
    // Calls the validation method on our observer component
    async onSubmit() {
      const validated = await this.$refs.containerForm.validate()

      if (!validated) return

      this.addContainer()
    },
    addContainer() {
      let containerAttributes = {
        NAME: this.NAME,
        DEWARID: this.DEWARID,
        CAPACITY: this.containerType.CAPACITY,
        CONTAINERTYPE: this.CONTAINERTYPE,
        AUTOMATED: this.AUTOMATED > 0 ? this.AUTOMATED : null,
        PERSONID: this.PERSONID,
        COMMENTS: this.COMMENTS,
        BARCODE: this.BARCODE
      }
      if (this.plateType === 'plate') {
        containerAttributes = {
          ...containerAttributes,
          REQUESTEDIMAGERID: this.REQUESTEDIMAGERID,
          SCHEDULEID: this.SCHEDULEID,
          SCREENID: this.SCREENID
        }
      } else if (this.plateType === 'puck') {
        containerAttributes = {
          ...containerAttributes,
          CONTAINERREGISTRYID: this.CONTAINERREGISTRYID,
          PROCESSINGPIPELINEID: this.PROCESSINGPIPELINEID,
          SPACEGROUP: this.SPACEGROUP
        }
      } else if (this.plateType === 'pcr') {
        containerAttributes = {
          ...containerAttributes,
          EXPERIMENTTYPEID: this.EXPERIMENTTYPEID,
          STORAGETEMPERATURES: this.STORAGETEMPERATURES
        }
      }

      this.saveContainer(new Container(containerAttributes))
    },
    async saveContainer(model) {
      try {
        const result = await this.$store.dispatch('saveModel', { model })

        const containerId = result.get('CONTAINERID')

        // Save samples added in the container
        if (!containerId) return

        const containerModel = new Container({ CONTAINERID: containerId })
        const container = await this.$store.dispatch('getModel', containerModel)
        const containerQueueId = container.get('CONTAINERQUEUEID')

        if (containerQueueId) {
          await this.toggleContainerQueue(true, containerId)
        }

        await this.$store.dispatch('samples/save', containerId)
        this.$store.commit('notifications/addNotification', {
          message: `New Container created, click <a href=/containers/cid/${containerId}>here</a> to view it`,
          level: 'info',
          persist: true
        })
        // If we have a container id we are creating all samples
        // On success, reset because we will want to start with a clean slate
        this.$store.commit('samples/reset')

        // Reset container - we may want to add more containers so just reset the name and barcode
        this.NAME = ''
        this.BARCODE = ''
        // Reset state of form
        this.$refs.containerForm.reset()
      } catch (error) {
        this.$store.commit('notifications/addNotification', {
          message: 'Something went wrong creating this container, please try again',
          level: 'error'
        })
      } finally {
        window.scrollTo(0,0);
      }
    },
    resetSamples(capacity) {
      this.$store.commit('samples/reset', capacity)
      // this.$store.commit('samples/set', { data: this.samples.map((sample => {}))})
    },
    async onContainerCellClicked(args) {
      let location, index
      if (args && typeof args === 'object' && !Array.isArray(args)) {
        ({ location, index } = args);
      } else {
        return
      }

      if (index || index > -1) {
        this.wellDrop = index
      }
      // We want to validate each single sample form before they current location is saved.
      // This is because only one sample form is displayed at a time.
      if (this.containerType.CAPACITY > 25) {
        const validatedForm = await this.$refs.containerForm.validate()

        if (validatedForm) {
          this.sampleLocation = +location - 1
        }
      } else {
        this.sampleLocation = +location - 1
      }
    },
    async viewSchedule() {
      const schedule = this.imagingSchedules.find(schedule => schedule.SCHEDULEID === this.SCHEDULEID)
      if (schedule) {
        this.selectedSchedule = schedule
        await this.getImagingScheduleComponentsCollection()
        this.displayImagerScheduleModal = true
      } else {
        this.displayImagerScheduleModal = false
      }
    },
    closeModalAction() {
      this.displayImagerScheduleModal = false
    },
    async checkContainerBarcode() {
      try {
        const response = await this.$store.dispatch('fetchDataFromApi', {
          url: `/shipment/containers/barcode/${this.BARCODE}`,
          requestType: 'fetching barcode status'
        })

        const { PROP } = response
        this.BARCODECHECK = 0
        this.barcodeMessage = `This barcode is already registered to ${PROP}`
      } catch (error) {
        this.BARCODECHECK = 1
        this.barcodeMessage = ''
      }
    },
    async assignScreeningComponent(newValue) {
      if (newValue) {
        this.selectedScreen = { SCREENID: newValue }
        await this.fetchScreenComponents()
        await this.fetchScreenComponentsGroups()
        this.assignScreenComponentGroupToSamples()
      }
    },
    assignScreenComponentGroupToSamples() {
      this.samples.forEach((sample, index) => {
        const sampleWellLocation = this.containerTypeDetails.getWell(sample['LOCATION'])
        const group = this.screenComponentGroups.find(item => Number(item['POSITION']) === sampleWellLocation + 1)
        let data = null
        if (group) {
          data = group['SCREENCOMPONENTGROUPID']
        }

        this.$store.commit('samples/updateSamplesField', { path: `samples/${index}/SCREENCOMPONENTGROUPID`, value: data })
      })
    },
  }
}
</script>
<style scoped>
.barcode-message {
  left: 50%;
}
/*.barcode-message::before {*/
/*  @apply tw-absolute;*/
/*  left: -0.3em;*/
/*  top: 5%;*/
/*  content: '';*/
/*  border: 0.7em solid transparent;*/
/*  border-right-color: #ebebeb;*/
/*  transform: rotate(45deg);*/
/*}*/
</style>