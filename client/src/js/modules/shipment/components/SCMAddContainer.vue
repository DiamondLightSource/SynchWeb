<template>
  <div class="content">
    <h1>Add Container SCM style</h1>

    <!-- Wrap the form in an observer component so we can check validation state on submission -->
    <validation-observer ref="observer" v-slot="{ invalid }">

    <!-- Old Add containers had an assign button here - no point as there is a menu item for /assign -->
    <form class="tw-flex" method="post" id="add_container" @submit.prevent="onSubmit">

      <div class="form tw-w-1/2">

        <div class="tw-mb-2 tw-py-2">
          <span class="label">Shipment</span>
          <span><a class="tw-underline" :href="'/shipments/sid/'+dewar.SHIPPINGID">{{dewar.SHIPPINGNAME}}</a></span>
        </div>

        <div class="tw-mb-2 tw-py-2">
          <span class="label">Dewar</span>
          <span>{{dewar.CODE}}</span>
        </div>

        <!-- <div class="tw-mb-2 tw-py-2">
          <sw-select-input
            v-model="containerType"
            label="Container Type"
            :options="containerTypes"
            optionValueKey="CONTAINERTYPEID"
            optionTextKey="NAME"
          />
        </div> -->

        <div>
          <label>Show all container types</label>
          <sw-checkbox-input
            name="SHOW_ALL_CONTAINER_TYPES"
            v-model="showAllContainerTypes"
          />
        </div>

        <div class="tw-mb-2 tw-py-2">
          <sw-group-select-input
            v-model="containerType"
            label="Container Type"
            :groups="groupedContainerTypes"
            optionValueKey="CONTAINERTYPEID"
            optionTextKey="NAME"
          />
        </div>

        <validation-provider tag="div" rules="required" name="name" v-slot="{ errors }">
          <sw-text-input
            label="Container Name"
            v-model="containerName"
            :errorMessage="errors[0]"
          />
        </validation-provider>

        <div class="pck tw-mb-2 tw-py-2">
          <sw-select-input
            v-model="containerRegistryId"
            label="Registered Container"
            name="CONTAINERREGISTRYID"
            :options="containerRegistry"
            optionValueKey="CONTAINERREGISTRYID"
            optionTextKey="BARCODE"
          />
        </div>

        <div class="autoprocessing_options">
          <sw-select-input
            v-model="processingPipeline"
            label="Priority Processing"
            description="Other data reduction pipelines will run on a lower priority queue"
            name="PIPELINE"
            :options="processingPipelines"
            optionValueKey="PROCESSINGPIPELINEID"
            optionTextKey="NAME"
            />
        </div>

        <div class="pck">
          <label>Automated Collection</label>
          <sw-checkbox-input
            name="AUTOMATED"
            v-model="automated"
          />
        </div>

        <div class="pcr plate">
          <sw-text-input
            label="Barcode"
            name="BARCODE"
            v-model="barCode"
            />
        </div>

        <div>
            <sw-select-input
              label="Owner"
                description="This user will be emailed with container updates. Check your email is up to date!"
                name="PERSONID"
                v-model="owner"
                :options="users"
                optionValueKey="PERSONID"
                optionTextKey="FULLNAME"
                >
              <template v-slot:error-msg>
                <span v-show="validEmail" class="emsg tw-bg-content-light-background tw-text-xxs tw-ml-1 tw-p-1 tw-h-6">Please update your email address by clicking view</span>
              </template>
              <template v-slot:actions>
                <a :href="'/contacts/user/'+owner" class="button edit_user tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
              </template>
            </sw-select-input>
        </div>

        <div class="pcr">
          <sw-select-input
            v-model="experimentType"
            label="Experiment Type"
            name="EXPERIMENTTYPE"
            :options="experimentTypes"
            optionValueKey="ID"
            optionTextKey="NAME"
            />
        </div>

        <div class="pcr">
          <sw-select-input
            v-model="storageTemperature"
            label="Storage Temperature"
            name="STORAGETEMPERATURE"
            :options="storageTemperatures"
            optionValueKey="ID"
            optionTextKey="NAME"
            />
        </div>

        <sw-text-input id="comments" v-model="comments" name="COMMENTS" description="Comment for the container" label="Comments"/>

            <!-- VMXi Plates... -->
            <!-- <div class="plate">
                <label>Requested Imager
                    <span class="small">Imager this container should go into</span>
                </label>
                <select name="REQUESTEDIMAGERID"></select>
            </div>

            <div class="plate">
                <label>Imaging Schedule
                    <span class="small">Requested imaging schedule</span>
                </label>
                <select name="SCHEDULEID" class="tw-h-6"></select> <a href="#" class="button view_sch tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
            </div>

            <div class="plate">
                <label>Crystallisation Screen
                    <span class="small">Crystallisation screen that was used for this container</span>
                </label>
                <select name="SCREENID"></select>
            </div> -->
        <!-- Sample specific fields -->
        <div>
          <single-sample
            :proteins="proteins"
            v-model="sample"
            :experimentKind="sampleComponent">
            <!-- <template v-slot:experimentSampleMetaData>
              <component :is="sampleComponent" v-bind="{ name: experimentKind }"/>
            </template> -->
          </single-sample>
          <p>Protein selection: {{sample.acronym}}</p>
          <p>Sample name: {{sample.name}}</p>
        </div>

        <button name="submit" type="submit" class="button submit" :class="{ 'tw-border tw-border-red-500' : invalid}">Add Container</button>
      </div>

      <div class="tw-w-1/2">
        <container-graphic
        :geometry="containerGeometry"
        :containerType="plateType"
        :samples="samples"
        :key="plateKey"
        @cell-clicked="onContainerCellClicked"/>
      </div>

    </form>
    </validation-observer>

    </div>
</template>

<script>
import Container from 'models/container'
import ContainerTypes from 'modules/shipment/collections/containertypes'
import ContainerRegistry from 'modules/shipment/collections/containerregistry'
import ProcessingPipelines from 'collections/processingpipelines'
import Users from 'collections/users'

import DistinctProteins from 'modules/shipment/collections/distinctproteins'

import SwSelectInput from 'app/components/forms/sw_select_input.vue'
import SwGroupSelectInput from 'app/components/forms/sw_group_select_input.vue'
import SwTextInput from 'app/components/forms/sw_text_input.vue'
import SwTextAreaInput from 'app/components/forms/sw_textarea_input.vue'
import SwCheckboxInput from 'app/components/forms/sw_checkbox_input.vue'

import ContainerGraphic from 'modules/shipment/components/ContainerGraphic.vue'

import SingleSample from 'modules/shipment/components/samples/SingleSample.vue'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

const EXPERIMENT_TYPE_ROBOT = 1
const EXPERIMENT_TYPE_HPLC = 2

const STORAGE_TEMP_NEG_80 = -80
const STORAGE_TEMP_0 = 0
const STORAGE_TEMP_25 = 25

const initialSampleState = {
  acronym: '-',
  sampleType: '',
  name: 'sample1',
  volume: '1',
  column: '2',
  buffer: '3',
  SCORE: 1,
  LOCATION: '',
  plateTemperature: '',
  exposureTemperature: ''
}

export default {
  name: 'SCMAddContainer',
  components: {
    'sw-group-select-input': SwGroupSelectInput,
    'sw-select-input': SwSelectInput,
    'sw-text-input': SwTextInput,
    'sw-textarea-input': SwTextAreaInput,
    'sw-checkbox-input': SwCheckboxInput,
    'container-graphic': ContainerGraphic,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider,
    'single-sample': SingleSample,
  },
  props: {
    'mview':[Function, Promise], // The marionette view could be lazy loaded or static import
    'breadcrumbs' : Array,
    'breadcrumb_tags' : Array, // These are model properties appended to the breadcrumbs title
    'options': Object, // In common with container add views, this options should include a dewar model
  },
  data: function() {
    return {
      automated: '',
      barCode: '',
      comments: '',
      containerName: '',

      containerType: '',
      containerTypes: [],
      containerTypesCollection: null,

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
      // The container owner
      owner: 0,

      // The dewar that this container will belong to
      dewar: null,

      experimentType: 0,
      experimentTypes: [
        {ID: 0, NAME: '-'},
        {ID: EXPERIMENT_TYPE_ROBOT, NAME: 'Robot'},
        {ID: EXPERIMENT_TYPE_HPLC, NAME: 'HPLC'},
      ],

      containerRegistry: [],
      containerRegistryId: '',

      sampleComponent: '',
      samples: [],
      sample: initialSampleState,
      sampleLocation: 1, // Currently active sample being edited

      storageTemperature: 0,
      storageTemperatures: [
        {ID: -1, NAME: '-'},
        {ID: STORAGE_TEMP_NEG_80, NAME: '-80'},
        {ID: STORAGE_TEMP_0, NAME: '0'},
        {ID: STORAGE_TEMP_25, NAME: '25'},
      ],

      plateKey: 0,
      plateType: null,

      processingPipeline: '',
      processingPipelines: [],

      proposalFilter: [],

      proteinsCollection: null,
      proteins: [],
      proteinSelection: null,

      showAllContainerTypes: false,

      usersCollection: null,
      users: []
    }
  },

  computed: {
    // This takes the containerTypes collection and groups the options based on the proposal type
    // It assumes that any proposal type listed in proposalFilter should be included
    groupedContainerTypes: function() {
      let groups = []
      for (var i=0; i<this.proposalFilter.length; i++) {
        // Find all containers with this proposal Type
        let proposalType = this.proposalFilter[i]
        let containers = this.containerTypes.filter(container => container.PROPOSALTYPE === proposalType)
        groups.push({name: proposalType, options: containers})
      }
      return groups
    },
    // Build the complete list of proposal types included for each container type
    proposalTypesFilter: function() {
      let types = this.containerTypes.map( container => container.PROPOSALTYPE )
      let unique = types.filter( (value, index, self) => self.indexOf(value) === index )
      return unique
    },
  },

  watch: {
    // If set we should show all container types from all proposal types
    showAllContainerTypes: function(newVal) {
      if (newVal) this.proposalFilter = this.proposalTypesFilter
      else this.proposalFilter = [this.$store.state.proposal.proposalType]
    },
    sampleLocation: function(newLocation, oldLocation) {
      // Take what was saved in sample and store in array
      console.log("Temp save sample and use new location")
      if (!this.sample.name) this.sample.SCORE = 0
      this.samples.splice(oldLocation-1, 1, this.sample)
      this.samples[oldLocation-1].LOCATION = oldLocation
      let newState = this.samples[newLocation-1] || initialSampleState
      this.sample = Object.assign({}, this.sample, newState)
      // Forces a plate re-render... TODO fix!
      this.plateKey += 1
    },
    containerType: function(newVal) {
      let type = this.containerTypesCollection.findWhere({CONTAINERTYPEID: newVal})
      this.updateContainerGeometry(type.toJSON())
    },
    experimentType: function(newVal) {
      // Make sure we compare a number
      let experiment = +newVal
      switch(experiment) {
        case EXPERIMENT_TYPE_ROBOT:
          this.sampleComponent = 'robot'
          break
        case EXPERIMENT_TYPE_HPLC:
          this.sampleComponent = 'hplc'
          break
        default:
          this.sampleComponent = ''
      }
      console.log("Switching sample component to " + this.sampleComponent)
    }
  },

  created: function() {
    this.dewar = this.options.dewar.toJSON()

    this.proposalFilter = [this.$store.state.proposal.proposalType]

    this.containerTypesCollection = new ContainerTypes()
    let containerRegistryCollection = new ContainerRegistry(null, { state: { pageSize: 9999 }})

    this.proteinsCollection = new DistinctProteins()
    // If we want to only allow valid samples
    if (app.options.get('valid_components') && !app.staff) {
        this.proteinsCollection.queryParams.external = 1
    }
    // For now assume Green only
    // this.proteinsCollection.queryParams.SAFETYLEVEL = 'GREEN';

    let processingPipelinesCollection = new ProcessingPipelines()
    processingPipelinesCollection.queryParams.pipelinestatus = 'optional'
    processingPipelinesCollection.queryParams.category = 'processing'

    this.usersCollection = new Users(null, { state: { pageSize: 9999 }})
    this.usersCollection.queryParams.all = 1
    this.usersCollection.queryParams.pid = this.$store.state.proposal.proposalModel.get('PROPOSALID')


    this.$store.dispatch('getCollection', this.containerTypesCollection).then( (result) => {
      this.containerTypes = result.toJSON()
      this.containerType = this.containerTypes[0]['CONTAINERTYPEID']
    })
    this.$store.dispatch('getCollection', containerRegistryCollection).then( (result) => {
      this.containerRegistry = result.toJSON()
      this.containerRegistry.push({CONTAINERREGISTRYID: 0, BARCODE: "-"})
    })
    this.$store.dispatch('getCollection', this.proteinsCollection).then( (result) => {
      console.log("Proteins = " + JSON.stringify(result))
      this.proteins = result.toJSON()
    })
    this.$store.dispatch('getCollection', processingPipelinesCollection).then( (result) => {
      this.processingPipelines = result.toJSON()
    })
    this.$store.dispatch('getCollection', this.usersCollection).then( (result) => {
      this.users = result.toJSON()
      this.owner = this.users[0]['PERSONID']
    })
  },

  methods: {
    onSubmit: function() {
      console.log("onSubmit")
      this.$refs.observer.validate().then( (result) => {
        if (result) this.addContainer()
        else console.log("Form validation failed ")
      })
    },
    addContainer: function() {
      let containerModel = new Container({
        DEWARID: this.options.dewar.get('DEWARID'),
        BARCODECHECK: null,
        CAPACITY: this.containerGeometry.capacity,
        CONTAINERTYPE: this.plateType,
        PROCESSINGPIPELINEID: this.processingPipeline,
        NAME: this.containerName,
        CONTAINERREGISTRYID: this.containerRegistryId,
        AUTOMATED: this.automated,
        BARCODE: this.barCode,
        PERSONID: this.owner,
        EXPERIMENTTYPE: this.experimentType,
        STORAGETEMPERATURE: this.storageTemperature,
        COMMENTS: this.comments,
        REQUESTEDIMAGERID: "",
        SCHEDULEID: "",
        SCREENID: "",
      })
      this.saveModel(containerModel)
      // Save the samples...
      console.log("addContainer")
      console.log("Samples: " + JSON.stringify(this.samples))
    },

    saveModel: function(model) {
      let self = this
      this.$store.commit('loading', true)

      model.save({}, {
        success: function(model, response) {
          self.$store.commit('loading', false)
          let cid = model.get('CONTAINERID')
          console.log("Container Model was saved " + JSON.stringify(response))
          console.log("Container ID = " + cid)
          self.$store.commit('add_notification', { message: 'New Container created, click <a href=/containers/cid/'+cid+'>here</a> to view it', level: 'info', persist: true})
          self.resetForm()
        },
        error: function(model, response, options) {
            self.$store.commit('loading', false)
            self.$store.commit('add_notification', { message: 'Something went wrong creating this container, please try again', level: 'error'})
        },
      })
    },

    resetForm: function() {
      console.log("Reset Form data")
    },

    onContainerCellClicked: function(location) {
      console.log("Cell clicked = " + location)
      this.sampleLocation = location
    },
    validEmail: function() {
      return false
    },
    // Move this to container graphic
    updateContainerGeometry: function(geometry) {
      this.containerGeometry.capacity = geometry.CAPACITY
      this.containerGeometry.drops.x = geometry.DROPPERWELLX
      this.containerGeometry.drops.y = geometry.DROPPERWELLY
      this.containerGeometry.drops.h = geometry.DROPHEIGHT
      this.containerGeometry.drops.w = geometry.DROPWIDTH
      this.containerGeometry.well = geometry.WELLDROP
      if (geometry.WELLPERROW) {
        this.containerGeometry.columns = geometry.WELLPERROW
        console.log("Number of plate = " + geometry.NAME)
        console.log("Number of columns = " + this.containerGeometry.columns)
        this.plateType = 'plate'
      } else {
        this.plateType = 'puck'
      }
      this.plateKey += 1
    }
  },
}
</script>