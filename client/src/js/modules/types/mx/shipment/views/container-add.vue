<template>
  <div class="content">
    <h1>Add Container</h1>

    <div class="tw-flex tw-flex-col">
      <!-- Wrap the form in an observer component so we can check validation state on submission -->
      <validation-observer ref="containerForm" v-slot="{ invalid, errors }">

        <!-- Old Add containers had an assign button here - try leaving it out as there is a menu item for /assign -->
        <form class="tw-flex" method="post" id="add_container" @submit.prevent="onSubmit">

          <!-- Left hand side is form controls -->
          <div class="form tw-w-1/2">

            <div class="tw-mb-2 tw-py-2">
              <span class="label">Shipment</span>
              <span><a class="tw-underline" :href="'/shipments/sid/'+dewar.SHIPPINGID">{{dewar.SHIPPINGNAME}}</a></span>
            </div>

            <div class="tw-mb-2 tw-py-2">
              <span class="label">Dewar</span>
              <span>{{dewar.CODE}}</span>
            </div>

            <div class="tw-mb-2 tw-py-2">
              <base-input-groupselect
                v-model="containerState.CONTAINERTYPEID"
                label="Container Type"
                :groups="groupedContainerTypes"
                optionValueKey="CONTAINERTYPEID"
                optionTextKey="NAME"
                defaultText="Please select a container type"
              />
            </div>

            <validation-provider tag="div" class="tw-mb-2 tw-py-2" rules="required" name="name" vid="container-name" v-slot="{ errors }">
              <base-input-text
                label="Container Name"
                v-model="containerState.NAME"
                :errorMessage="errors[0]"
              />
            </validation-provider>

            <div v-show="isPuck" class="pck tw-mb-2 tw-py-2">
              <base-input-select
                v-model="containerState.CONTAINERREGISTRYID"
                label="Registered Container"
                name="CONTAINERREGISTRYID"
                :options="containerRegistry"
                optionValueKey="CONTAINERREGISTRYID"
                optionTextKey="BARCODE"
              />
            </div>

            <div v-show="isPuck" class="autoprocessing_options tw-mb-2 tw-py-2">
              <base-input-select
                v-model="containerState.PROCESSINGPIPELINEID"
                label="Priority Processing"
                description="Other data reduction pipelines will run on a lower priority queue"
                name="PIPELINE"
                :options="processingPipelines"
                optionValueKey="PROCESSINGPIPELINEID"
                optionTextKey="NAME"
                />
            </div>

            <div class="pck tw-mb-2 tw-py-2">
              <label>Show all spacegroups</label>
              <base-input-checkbox
                name="SHOW SPACEGROUP"
                v-model="containerState.SPACEGROUP"
              />
            </div>

            <validation-provider tag="div" class="tw-mb-2 tw-py-2" rules="required" name="owner">
              <base-input-select
                label="Owner"
                  description="This user will be emailed with container updates. Check your email is up to date!"
                  name="PERSONID"
                  v-model="containerState.PERSONID"
                  :options="users"
                  optionValueKey="PERSONID"
                  optionTextKey="FULLNAME"
                  >
                <template v-slot:error-msg>
                  <span v-show="!ownerEmail" class="emsg tw-bg-content-light-background tw-text-xxs tw-ml-1 tw-p-1 tw-h-6">Please update your email address by clicking view</span>
                </template>
                <template v-slot:actions>
                  <a :href="'/contacts/user/'+containerState.PERSONID" class="button edit_user tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
                </template>
              </base-input-select>
            </validation-provider>

            <base-input-text outerClass="tw-mb-2 tw-py-2" id="comments" v-model="containerState.COMMENTS" name="COMMENTS" description="Comment for the container" label="Comments"/>

            <!-- VMXi Plates... -->
            <div v-show="isPlate " class="plate tw-mb-2 tw-py-2">
              <base-input-select
                v-model="containerState.REQUESTEDIMAGERID"
                label="Requested Imager"
                description="Imager this container should go into"
                name="REQUESTERIMAGER"
                :options="imagingImagers"
                optionValueKey="IMAGERID"
                optionTextKey="NAME"
              />
            </div>

            <div v-show="isPlate" class="plate tw-mb-2 tw-py-2">
              <base-input-select
                v-model="containerState.SCHEDULEID"
                label="Imaging Schedule"
                description="Requested Imaging Schedule"
                name="IMAGING SCHEDULE"
                :options="imagingSchedules"
                optionValueKey="SCHEDULEID"
                optionTextKey="NAME"
              >
                <template v-slot:actions>
                  <a href="#" @click="viewSchedule" class="button view_sch tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
                </template>
              </base-input-select>
            </div>

            <div v-show="isPlate" class="plate tw-mb-2 tw-py-2">
              <base-input-select
                v-model="containerState.SCREENID"
                label="Crystallisation Screen"
                description="Crystallisation screen that was used for this container"
                name="CRYSTALLISATION SCREEN"
                :options="imagingScreens"
                optionValueKey="SCREENID"
                optionTextKey="NAME"
              />
            </div>

            <div class="pck tw-mb-2 tw-py-2">
              <label>Queue For UDC</label>
              <base-input-checkbox
                name="Queue For UDC"
                v-model="containerState.QUEUEFORUDC"
              />
            </div>
          </div>


          <!-- Right hand side is container graphic -->
          <div class="tw-w-1/2">
            <div class="tw-justify-end">
            <valid-container-graphic
              ref="containerGraphic"
              :containerType="containerType"
              :samples="samples"
              @cell-clicked="onContainerCellClicked"/>
            </div>
          </div>
        </form>

        <div>
          <!-- Sample specific fields -->
          <component
            ref="sampleEditor"
            v-if="proteinsLoaded"
            :is="sampleComponent"
            @save-sample="onSaveSample"
            @clone-sample="onCloneSample"
            @clear-sample="onClearSample"
            @clone-container="onCloneContainer"
            @clear-container="onClearContainer"
            @clone-container-column="onCloneColumn"
            @clone-container-row="onCloneRow"
          />
        </div>
        <!--
          We can show the errors accumulated from the table here.
          The properties errors and invalid come from the validation observer.
          Each validation provider should provide a vid to key the error and a name for the error message.
        -->
        <div class="tw-w-full tw-bg-red-200 tw-border tw-border-red-500 tw-rounded tw-p-1 tw-mb-4" v-show="invalid">
          <p class="tw-font-bold">Please fix the errors on the form</p>
          <div v-for="(error, index) in errors" :key="index">
            <p v-show="error.length > 0" class="tw-black">{{error[0]}}</p>
          </div>
        </div>

        <div class="">
          <button name="submit" type="submit" @click.prevent="onSubmit" :class="['button submit tw-text-base tw-px-4 tw-py-2', invalid ? 'tw-border tw-border-red-500 tw-bg-red-500': '']">
            <i class="fa fa-plus"></i>
            Add Container
          </button>
        </div>
      </validation-observer>
    </div>

    <dialog-box
      v-if="displayImagerScheduleModal"
      size="large"
      :hide-ok-button="true"
      @close-modal-action="closeModalAction">
      <template>
        <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
          <p>View Schedule</p>
          <button
              class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
              @click="closeModalAction">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="tw-py-3 tw-px-4 tw-border-b tw-border-content-border">
          <div class="tw-border-b tw-border-content-border">
            <h3 class="tw-text-2xl">Schedule for {{ selectedSchedule.NAME }}</h3>
          </div>

          <div class="tw-w-full">
            <table-component :data="imagingScheduleComponents" :headers="schedulingComponentHeader"/>
          </div>
        </div>
      </template>

    </dialog-box>
  </div>
</template>

<script>
import Container from 'models/container'
import ValidContainerGraphic from 'modules/types/mx/samples/valid-container-graphic.vue'

import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputGroupSelect from 'app/components/base-input-groupselect.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import Dialog from 'app/components/dialogbox.vue'
import TableComponent from 'app/components/table.vue'
import SamplePlate from 'modules/types/mx/samples/samples-plate.vue'
import SingleSample from 'modules/types/mx/samples/single-sample.vue'

import ContainerMixin from 'modules/types/mx/shipment/views/container-mixin'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

const initialContainerState = {
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
  EXPERIMENTTYPEID: "",
  QUEUEFORUDC: false,
  SPACEGROUP: false
}

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
  mixins: [ContainerMixin],
  components: {
    'base-input-groupselect': BaseInputGroupSelect,
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
    'valid-container-graphic': ValidContainerGraphic,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider,
    'dialog-box': Dialog,
    'table-component': TableComponent,
    'single-sample-plate': SingleSample,
    'mx-sample-plate': SamplePlate
  },
  props: {
    'mview':[Function, Promise], // The marionette view could be lazy loaded or static import
    'breadcrumbs' : Array,
    'breadcrumb_tags' : Array, // These are model properties appended to the breadcrumbs title
    'options': Object, // In common with container add views, this options should include a dewar model
  },
  data() {
    return {
      containerState: initialContainerState,
      // The dewar that this container will belong to
      dewar: null,
      plateKey: 0,
      plateType: null,
      proteinCombo: '123540',
      proteinsCollection: null,
      gProteinsCollection: null,
      proteins: [],
      proteinSelection: null,
      selectedSample: null,
      showAllExperimentTypes: false,
      sampleLocation: 0,
      displayImagerScheduleModal: false,
      selectedSchedule: null,
      schedulingComponentHeader: [
        {key: 'OFFSET_HOURS', title: 'Offset Hours'},
        {key: 'INSPECTIONTYPE', title: 'Imaging Type'},
      ]
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
    // Build the complete list of proposal types included for each container type
    containerTypesFilter: function() {
      let types = this.containerTypes.map( container => container.PROPOSALTYPE )
      return types.filter( (value, index, self) => self.indexOf(value) === index )
    },
    // Build the complete list of proposal types included for each experiment type
    experimentTypesFilter: function() {
      let types = this.experimentTypes.map( experiment => experiment.PROPOSALTYPE )
      return types.filter( (value, index, self) => self.indexOf(value) === index )
    },
    ownerEmail: function() {
      // Does the selected owner have a valid email?
      if (!this.containerState.PERSONID) return false

      let owner = this.usersCollection.findWhere({PERSONID: this.containerState.PERSONID.toString()})

      return (owner && owner.get('EMAILADDRESS'))
    },
    containerGroup() {
      return this.$store.getters['proposal/currentProposalType']
    },
    sampleComponent() {
      // Use a table editor unless capacity > 25
      // If we have been passed a valid container id then we are editing the samples, else new table

      return this.containerType.CAPACITY > 25 ? 'single-sample-plate' : 'mx-sample-plate'
    }
  },
  watch: {
    // When the container type changes we need to reset the samples list and redraw the container graphic
    'containerState.CONTAINERTYPEID': function(newVal) {
      let type = this.containerTypesCollection.findWhere({CONTAINERTYPEID: newVal})

      if (!type) {
        return
      }
      this.containerState.CONTAINERTYPE = type.get('NAME')
      this.containerType = Object.assign(INITIAL_CONTAINER_TYPE, type.toJSON())

      this.resetSamples(type.get('CAPACITY'))
    },
    'containerState.AUTOMATED': function(newVal) {
        // If now on, add safetylevel to query
        // Automated collections limited to GREEN Low risk samples
        if (newVal) {
            this.proteinsCollection.queryParams.SAFETYLEVEL = 'GREEN';
        } else {
            delete this.proteinsCollection.queryParams.SAFETYLEVEL;
        }
        this.$store.dispatch('getCollection', this.proteinsCollection).then( (result) => {
          this.proteins = result.toJSON()
        })
        app.trigger('samples:automated', newVal)
    },
    'containerState.CONTAINERREGISTRYID': function(newVal) {
      if (this.isPuck && newVal) {
        // When a user selects a registered container we should update the name/barcode
        let entry = this.containerRegistry.find( item => item.CONTAINERREGISTRYID === newVal)
        this.containerState.NAME = entry['BARCODE'] || '-'
      }
    },
    'containerState.QUEUEFORUDC': function(newVal) {
      let samples
      if (newVal) {
        samples = this.samples.map(sample => ({
          ...sample,
          CENTRINGMETHOD: 'xray',
          EXPERIMENTKIND: 'Ligand binding',
          SCREENINGMETHOD: 'none',
        }))

        this.containerState.AUTOMATED = 1
      } else {
        samples = this.samples.map(sample => ({
          ...sample,
          CENTRINGMETHOD: '',
          EXPERIMENTKIND: '',
          SCREENINGMETHOD: '',
          ENERGY: '',
          REQUIREDRESOLUTION: '',
          MINIMUMRESOLUTION: '',
          SCREENINGCOLLECTVALUE: '',
        }))

        this.containerState.AUTOMATED = ''
      }

      this.$store.commit('samples/set', samples)
    },
    containerRegistry(newVal) {
      if (newVal && newVal.length > 0) {
        const [firstContainerRegistry] = newVal
        this.containerState.CONTAINERREGISTRYID = firstContainerRegistry.CONTAINERREGISTRYID
        this.containerState.NAME = firstContainerRegistry.BARCODE
      }
    },
    'containerState.SPACEGROUP': function() {
      this.getSpaceGroupsCollection()
    },
  },
  created: function() {
    this.containerType = INITIAL_CONTAINER_TYPE
    this.dewar = this.options.dewar.toJSON()
    this.containerState.DEWARID = this.dewar.DEWARID

    this.resetSamples(this.containerType.CAPACITY)

    this.getProteins()
    this.getExperimentTypes()
    this.getContainerTypes()
    this.getContainerRegistry()
    this.getUsers()
    this.getProcessingPipelines()
    this.formatExperimentKindList()
    this.getSampleGroups()
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
      let experimentType = this.experimentTypesCollection.findWhere({EXPERIMENTTYPEID: this.containerState.EXPERIMENTTYPEID})

      let containerModel = new Container({
        DEWARID: this.containerState.DEWARID,
        BARCODECHECK: null,
        CAPACITY: this.containerType.CAPACITY,
        CONTAINERTYPE: this.containerState.CONTAINERTYPE,
        PROCESSINGPIPELINEID: this.containerState.PROCESSINGPIPELINEID,
        NAME: this.containerState.NAME,
        CONTAINERREGISTRYID: this.containerState.CONTAINERREGISTRYID,
        AUTOMATED: this.containerState.AUTOMATED > 0 ? this.containerState.AUTOMATED : null,
        BARCODE: this.containerState.CODE,
        PERSONID: this.containerState.PERSONID,
        EXPERIMENTTYPE: experimentType.get('NAME') || '',
        STORAGETEMPERATURE: this.containerState.STORAGETEMPERATURE,
        COMMENTS: this.containerState.COMMENTS,
        REQUESTEDIMAGERID: "",
        SCHEDULEID: "",
        SCREENID: "",
      })
      this.saveContainer(containerModel)
    },
    async saveContainer(model) {
      try {
        const result = await this.$store.dispatch('saveModel', { model: model })

        const containerId = result.get('CONTAINERID')

        // Save samples added in the container
        if (!containerId) return

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
        this.containerState.NAME = ''
        this.containerState.CODE = ''
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
    async onContainerCellClicked(location) {
      // We want to validate each single sample form before they current location is saved.
      // This is because only one sample form is displayed at a time.
      if (this.containerType.CAPACITY > 25) {
        const validatedForm = await this.$refs.containerForm.validate()

        if (validatedForm) {
          this.sampleLocation = location - 1
        }
      } else {
        this.sampleLocation = location - 1
      }
    },
    async viewSchedule() {
      const schedule = this.imagingSchedules.find(schedule => schedule.SCHEDULEID === this.containerState.SCHEDULEID)
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
  },
  provide() {
    return {
      $shipments: () => ([]),
      $dewars: () => ([]),
      $containers: () => ([])
    }
  }
}
</script>