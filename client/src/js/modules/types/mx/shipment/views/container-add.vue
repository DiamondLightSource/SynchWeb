<template>
  <div class="content">
    <h1>Add Container</h1>

    <div class="tw-flex tw-flex-col">
      <!-- Wrap the form in an observer component so we can check validation state on submission -->
      <validation-observer ref="observer" v-slot="{ invalid, errors }">

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

            <div>
              <label>Show all container types</label>
              <base-input-checkbox
                name="SHOW_ALL_CONTAINER_TYPES"
                v-model="showAllContainerTypes"
              />
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

            <div v-show="isPuck" class="pck tw-mb-2 tw-py-2">
              <label>Automated Collection</label>
              <base-input-checkbox
                name="AUTOMATED"
                v-model="containerState.AUTOMATED"
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
                <label>Requested Imager
                    <span class="small">Imager this container should go into</span>
                </label>
                <select name="REQUESTEDIMAGERID"></select>
            </div>

            <div v-show="isPlate" class="plate tw-mb-2 tw-py-2">
                <label>Imaging Schedule
                    <span class="small">Requested imaging schedule</span>
                </label>
                <select name="SCHEDULEID" class="tw-h-6"></select> <a href="#" class="button view_sch tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
            </div>

            <div v-show="isPlate" class="plate tw-mb-2 tw-py-2">
                <label>Crystallisation Screen
                    <span class="small">Crystallisation screen that was used for this container</span>
                </label>
                <select name="SCREENID"></select>
            </div>

            <div>
              <label>Allow UDC</label>
              <base-input-checkbox
                name="ALLOW_UDC"
                v-model="showUDCColumns"
              />
            </div>
          </div>


          <!-- Right hand side is container graphic -->
          <div class="tw-w-1/2">
            <div class="tw-justify-end">
            <valid-container-graphic
            :containerType="containerType"
            :samples="validSamples"
            @cell-clicked="onContainerCellClicked"/>
            </div>
          </div>
        </form>

        <div>
          <!-- Sample specific fields -->
          <sample-editor
            v-if="proteinsLoaded"
            :containerType="containerType"
            :experimentKind="containerState.EXPERIMENTTYPEID"
            :proteins="proteinsCollection"
            :gproteins="gProteinsCollection"
            :automated="containerState.AUTOMATED"
            @select-sample="onSelectSample"
            @reset-form-validation="resetFormValidation"
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
            <p v-show="error.length > 0" class="tw-black">{{index}}: {{error[0]}}</p>
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
  </div>
</template>

<script>
import Backbone from 'backbone'
import Container from 'models/container'
import ContainerGraphic from 'modules/shipment/components/ContainerGraphic.vue'
import ValidContainerGraphic from 'modules/types/saxs/samples/valid-container-graphic.vue'
import ContainerTypes from 'modules/shipment/collections/containertypes'
import ContainerRegistry from 'modules/shipment/collections/containerregistry'

import DistinctProteins from 'modules/shipment/collections/distinctproteins'
import ExperimentTypes from 'modules/shipment/collections/experimenttypes'

import EventBus from 'app/components/utils/event-bus.js'

import SampleEditor from 'modules/types/mx/samples/sample-editor.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputGroupSelect from 'app/components/base-input-groupselect.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import SpaceGroupList from 'utils/sgs.js'
import CenteringMethodList from 'utils/centringmethods.js'
import AnomalousList from 'utils/anoms.js'
import ExperimentKindsList from 'utils/experimentkinds.js'

import ProcessingPipelines from 'collections/processingpipelines'
import Users from 'collections/users'

import { mapGetters } from 'vuex'

import { ValidationObserver, ValidationProvider, Validator }  from 'vee-validate'

const STORAGE_TEMP_NEG_80 = -80
const STORAGE_TEMP_0 = 0
const STORAGE_TEMP_25 = 25

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
  STORAGETEMPERATURE: "",
  COMMENTS: "",
  REQUESTEDIMAGERID: null,
  SCHEDULEID: null,
  SCREENID: null,
  EXPERIMENTTYPEID: "",
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
// Wrap the ajax call into a promise
// Move this to the store later?
const checkBarcode = function(value) {
  return new Promise((resolve, reject) => {
    Backbone.ajax({
        url: app.apiurl+'/shipment/containers/barcode/'+value,
        success: function(resp) {
          resolve(resp)
        },
        error: function(err) {
          reject(err)
        }
    })
  })
}

// A Method used by vee-validate
const validateBarcode = function(value) {
  return new Promise((resolve, reject) => {
    let retVal = {valid: false, data: { message: ''}}

    checkBarcode(value).then( () => {
      // A 200 response means the barcode is in use
      retVal.valid = false
      retVal.data.message ='This barcode is already registered'
    }, (response) => {
      // If there is an error (400) response, then no barcode exists with this value, so it's OK!
      retVal.valid = true
      retVal.data.message = response.responseText || 'This barcode is available'
    }).finally(() => {
      resolve(retVal)
    })
  })
}

// Setup barcode check validation rule
Validator.extend('unique-barcode', {
  validate: validateBarcode,
  getMessage: (field, params, data) => {
    return data.message;
  }
});

export default {
  name: 'MxAddContainer',
  components: {
    'base-input-groupselect': BaseInputGroupSelect,
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
    'container-graphic': ContainerGraphic,
    'valid-container-graphic': ValidContainerGraphic,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider,
    'sample-editor': SampleEditor,
  },
  props: {
    'mview':[Function, Promise], // The marionette view could be lazy loaded or static import
    'breadcrumbs' : Array,
    'breadcrumb_tags' : Array, // These are model properties appended to the breadcrumbs title
    'options': Object, // In common with container add views, this options should include a dewar model
  },
  data: function() {
    return {
      containerState: initialContainerState,

      containerType: INITIAL_CONTAINER_TYPE,
      containerTypes: [],
      containerTypesCollection: null,
      containerRegistryCollection: null,

      // The dewar that this container will belong to
      dewar: null,

      experimentTypes: [],
      experimentTypesCollection: null,

      containerRegistry: [],
      containerRegistryId: '',
      containerGroup: '',

      selectedSample: null,

      storageTemperatures: [
        {ID: '', NAME: '-'},
        {ID: STORAGE_TEMP_NEG_80, NAME: '-80'},
        {ID: STORAGE_TEMP_0, NAME: '0'},
        {ID: STORAGE_TEMP_25, NAME: '25'},
      ],

      plateKey: 0,
      plateType: null,

      processingPipeline: '',
      processingPipelines: [],

      proteinCombo: '123540',
      proteinsLoaded: false,
      proteinsCollection: null,
      gProteinsCollection: null,
      proteins: [],
      proteinSelection: null,

      showAllContainerTypes: false,
      showAllExperimentTypes: false,

      usersCollection: null,
      users: [],
      spaceGroups: SpaceGroupList.list,
      centeringMethods: CenteringMethodList.list,
      anomalousList: AnomalousList.list,
      experimentKindList: [],
      showUDCColumns: false
    }
  },
  computed: {
    // This takes the containerTypes collection and groups the options based on the proposal type
    // It assumes that any proposal type listed in containerFilter should be included
    groupedContainerTypes: function() {
      let groups = []
      for (var i=0; i<this.containerFilter.length; i++) {
        // Find all containers with this proposal Type
        let proposalType = this.containerFilter[i]
        let containers = this.containerTypes.filter(container => container.PROPOSALTYPE === proposalType)
        groups.push({name: proposalType, options: containers})
      }
      return groups
    },
    groupedExperimentTypes: function() {
      let groups = []
      for (var i=0; i<this.experimentFilter.length; i++) {
        // Find all containers with this proposal Type
        let proposalType = this.experimentFilter[i]
        let experiments = this.experimentTypes.filter(experiment => experiment.PROPOSALTYPE === proposalType)
        groups.push({name: proposalType, options: experiments})
      }
      return groups
    },
    // Build the complete list of proposal types included for each container type
    containerTypesFilter: function() {
      let types = this.containerTypes.map( container => container.PROPOSALTYPE )
      let unique = types.filter( (value, index, self) => self.indexOf(value) === index )
      return unique
    },
    // Build the complete list of proposal types included for each experiment type
    experimentTypesFilter: function() {
      let types = this.experimentTypes.map( experiment => experiment.PROPOSALTYPE )
      let unique = types.filter( (value, index, self) => self.indexOf(value) === index )
      return unique
    },
    containerFilter: function() {
      if (this.showAllContainerTypes) return this.containerTypesFilter
      else return [this.$store.state.proposal.proposalType]
    },
    experimentFilter: function() {
      if (this.showAllExperimentTypes) return this.experimentTypesFilter
      return [this.$store.state.proposal.proposalType]
    },
    ownerEmail: function() {
      // Does the selected owner have a valid email?
      if (!this.containerState.PERSONID) return false

      let owner = this.usersCollection.findWhere({PERSONID: this.containerState.PERSONID.toString()})

      if (owner && owner.get('EMAILADDRESS')) return true
      else return false
    },
    isPuck() {
      return this.containerType.WELLPERROW == null ? true : false
    },
    isPlate() {
      return this.containerType.WELLPERROW > 0 ? true : false
    },

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
      samples: ['samples/samples']
    }),
  },

  watch: {
    showAllContainerTypes: function(newVal) {
      // Which container id should be selected
      if (newVal) this.containerState.CONTAINERTYPEID = "!"
    },
    // When the container type changes we need to reset the samples list and redraw the container graphic
    'containerState.CONTAINERTYPEID': function(newVal) {
      let type = this.containerTypesCollection.findWhere({CONTAINERTYPEID: newVal})

      if (!type) {
        console.log("Could not find container type: " + newVal)
        return
      }
      this.containerState.CONTAINERTYPE = type.get('NAME')
      this.containerGroup = type.get('PROPOSALTYPE')
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
      // When a user selects a registered container we should update the name/barcode
      let entry = this.containerRegistry.find( item => item.CONTAINERREGISTRYID == newVal)
      this.containerState.NAME = entry['BARCODE'] || '-'
    },
  },

  created: function() {
    this.dewar = this.options.dewar.toJSON()
    this.containerState.DEWARID = this.dewar.DEWARID

    // Used to help show/hide fields
    this.containerGroup = this.$store.state.proposalType

    this.resetSamples(this.containerType.CAPACITY)

    this.getProteins()
    this.getExperimentTypes()
    this.getContainerTypes()
    this.getContainerRegistry()
    this.getUsers()
    this.getProcessingPipelines()
    this.formatExperimentKindList()
  },

  methods: {
    getProteins: function() {
      this.proteinsCollection = new DistinctProteins()
      // If we want to only allow valid samples
      if (app.options.get('valid_components') && !app.staff) {
          this.proteinsCollection.queryParams.external = 1
      }

      this.gProteinsCollection = new DistinctProteins()
      // For now assume Green only
      // this.proteinsCollection.queryParams.SAFETYLEVEL = 'GREEN';

      this.$store.dispatch('getCollection', this.proteinsCollection).then( (result) => {
        this.proteins = result.toJSON()
        this.proteinsLoaded = true
      })
    },
    getExperimentTypes: function() {
      this.experimentTypesCollection = new ExperimentTypes()

      this.experimentFilter = [this.$store.state.proposal.proposalType]

      this.$store.dispatch('getCollection', this.experimentTypesCollection).then( (result) => {
        this.experimentTypes = result.toJSON()
        // We need to find the first experiment type that matches our proposal type
        let initialExperimentType = result.findWhere({PROPOSALTYPE: this.$store.state.proposal.proposalType})
        this.containerState.EXPERIMENTTYPEID = initialExperimentType ? initialExperimentType.get('EXPERIMENTTYPEID') : ''
      })
    },
    getContainerRegistry: function() {
      this.containerRegistryCollection = new ContainerRegistry(null, { state: { pageSize: 9999 }})

      this.$store.dispatch('getCollection', this.containerRegistryCollection).then( (result) => {
        this.containerRegistry = result.toJSON()
        this.containerRegistry.unshift({CONTAINERREGISTRYID: 0, BARCODE: "-"})
      })
    },
    getContainerTypes: function() {
      this.containerTypesCollection = new ContainerTypes()

      this.containerFilter = [this.$store.state.proposal.proposalType]

      this.$store.dispatch('getCollection', this.containerTypesCollection).then( (result) => {
        this.containerTypes = result.toJSON()
        // Do we have valid start state?
        if (this.containerTypes.length) {
          let initialContainerType = result.findWhere({PROPOSALTYPE: this.containerFilter[0]})
          this.containerState.CONTAINERTYPEID = initialContainerType ? initialContainerType.get('CONTAINERTYPEID') : ''
        }
      })
    },
    getUsers: function() {
      this.usersCollection = new Users(null, { state: { pageSize: 9999 }})
      this.usersCollection.queryParams.all = 1
      this.usersCollection.queryParams.pid = this.$store.state.proposal.proposalModel.get('PROPOSALID')

      this.$store.dispatch('getCollection', this.usersCollection).then( (result) => {
        this.users = result.toJSON()
        // Set plate owner to current user
        this.containerState.PERSONID = this.$store.state.user.personId
      })
    },
    getProcessingPipelines: function() {
      let processingPipelinesCollection = new ProcessingPipelines()

      processingPipelinesCollection.queryParams.pipelinestatus = 'optional'
      processingPipelinesCollection.queryParams.category = 'processing'
      
      this.$store.dispatch('getCollection', processingPipelinesCollection).then( (result) => {
        this.processingPipelines = result.toJSON()
      })
    },
    // Called on Add Container
    // Calls the validation method on our observer component
    async onSubmit() {
      const validated = await this.$refs.observer.validate()
      console.log({validated})

      if (validated) {
        this.addContainer()
      } else {
        console.log("Form validation failed ")
      }
    },
    addContainer: function() {
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
      // Save the samples...
      console.log("addContainer: " + JSON.stringify(containerModel))
    },

    saveContainer: function(model) {
      // this.$store.commit('loading', true)
      this.$store.dispatch('saveModel', {model: model}).then( (result) => {
        let cid = model.get('CONTAINERID')
        this.$store.commit('notifications/addNotification', { message: 'New Container created, click <a href=/containers/cid/'+cid+'>here</a> to view it', level: 'info', persist: true})

        EventBus.$emit('save-samples', cid)

        // Reset container - we may want to add more containers so just reset the name and barcode
        this.containerState.NAME = ''
        this.containerState.CODE = ''
        // Reset state of form
        this.$refs.observer.reset()
      }, (err) => {
        console.log("Error saving Container: " + err)
        this.$store.commit('notifications/addNotification', { message: 'Something went wrong creating this container, please try again', level: 'error'})
      }).finally( () => {
        // this.$store.commit('loading', false)
        // Test scroll to top
        window.scrollTo(0,0);
      })
    },

    // Reset Backbone Samples Collection
    resetSamples: function(capacity) {
      this.$store.commit('samples/reset', capacity)
    },

    onContainerCellClicked: function(location) {
      EventBus.$emit('select-sample', location)
    },
    formatExperimentKindList() {
      for (const [key, value] of Object.entries(ExperimentKindsList.list)) {
        this.experimentKindList.push({ value: key, text: value })
      }
    }
  },
  provide() {
    return {
      $spaceGroups: this.spaceGroups,
      $centeringMethods: this.centeringMethods,
      $anomalousList: this.anomalousList,
      $experimentKindList: this.experimentKindList,
      $showUDCColumns: () => this.showUDCColumns
    }
  }
}
</script>