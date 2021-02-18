<template>
  <div class="content">
    <h1>Add Container SCM style</h1>

    <!-- Wrap the form in an observer component so we can check validation state on submission -->
    <validation-observer ref="observer" v-slot="{ invalid }">

      <div class="tw-flex tw-flex-col">

      <!-- Old Add containers had an assign button here - no point as there is a menu item for /assign -->
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
            <sw-checkbox-input
              name="SHOW_ALL_CONTAINER_TYPES"
              v-model="showAllContainerTypes"
            />
          </div>

          <div class="tw-mb-2 tw-py-2">
            <sw-group-select-input
              v-model="containerState.CONTAINERTYPE"
              label="Container Type"
              :groups="groupedContainerTypes"
              optionValueKey="CONTAINERTYPEID"
              optionTextKey="NAME"
              defaultText="Please select a container type"
            />
          </div>

          <validation-provider tag="div" rules="required" name="name" v-slot="{ errors }">
            <sw-text-input
              label="Container Name"
              v-model="containerState.NAME"
              :errorMessage="errors[0]"
            />
          </validation-provider>

          <div v-show="puck" class="pck tw-mb-2 tw-py-2">
            <sw-select-input
              v-model="containerState.CONTAINERREGISTRYID"
              label="Registered Container"
              name="CONTAINERREGISTRYID"
              :options="containerRegistry"
              optionValueKey="CONTAINERREGISTRYID"
              optionTextKey="BARCODE"
            />
          </div>

          <div v-show="puck" class="autoprocessing_options">
            <sw-select-input
              v-model="containerState.PROCESSINGPIPELINEID"
              label="Priority Processing"
              description="Other data reduction pipelines will run on a lower priority queue"
              name="PIPELINE"
              :options="processingPipelines"
              optionValueKey="PROCESSINGPIPELINEID"
              optionTextKey="NAME"
              />
          </div>

          <div v-show="puck" class="pck">
            <label>Automated Collection</label>
            <sw-checkbox-input
              name="AUTOMATED"
              v-model="containerState.AUTOMATED"
            />
          </div>

          <div v-show="!puck" class="pcr plate">
            <sw-text-input
              label="Barcode"
              name="BARCODE"
              v-model="containerState.BARCODE"
              />
          </div>

          <div>
            <sw-select-input
              label="Owner"
                description="This user will be emailed with container updates. Check your email is up to date!"
                name="PERSONID"
                v-model="containerState.PERSONID"
                :options="users"
                optionValueKey="PERSONID"
                optionTextKey="FULLNAME"
                >
              <template v-slot:error-msg>
                <span v-show="validEmail" class="emsg tw-bg-content-light-background tw-text-xxs tw-ml-1 tw-p-1 tw-h-6">Please update your email address by clicking view</span>
              </template>
              <template v-slot:actions>
                <a :href="'/contacts/user/'+containerState.PERSONID" class="button edit_user tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
              </template>
            </sw-select-input>
          </div>

          <div>
            <label>Show all experiment types</label>
            <sw-checkbox-input
              name="SHOW_ALL_EXPERIMENT_TYPES"
              v-model="showAllExperimentTypes"
            />
          </div>

          <div v-show="containerGroup == 'scm'" class="tw-mb-2 tw-py-2">
            <sw-group-select-input
              v-model="containerState.EXPERIMENTTYPEID"
              label="Experiment Type"
              :groups="groupedExperimentTypes"
              optionValueKey="EXPERIMENTTYPEID"
              optionTextKey="NAME"
              defaultText="Please select an experiment type"
            />
          </div>

          <div v-show="containerGroup == 'scm'" class="pcr">
            <sw-select-input
              v-model="containerState.STORAGETEMPERATURE"
              label="Storage Temperature"
              name="STORAGETEMPERATURE"
              :options="storageTemperatures"
              optionValueKey="ID"
              optionTextKey="NAME"
              />
          </div>

          <sw-text-input id="comments" v-model="containerState.COMMENTS" name="COMMENTS" description="Comment for the container" label="Comments"/>

          <!-- VMXi Plates... -->
          <div v-show="plate && containerGroup == 'mx'" class="plate">
              <label>Requested Imager
                  <span class="small">Imager this container should go into</span>
              </label>
              <select name="REQUESTEDIMAGERID"></select>
          </div>

          <div v-show="plate && containerGroup == 'mx'" class="plate">
              <label>Imaging Schedule
                  <span class="small">Requested imaging schedule</span>
              </label>
              <select name="SCHEDULEID" class="tw-h-6"></select> <a href="#" class="button view_sch tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
          </div>

          <div v-show="plate && containerGroup == 'mx'" class="plate">
              <label>Crystallisation Screen
                  <span class="small">Crystallisation screen that was used for this container</span>
              </label>
              <select name="SCREENID"></select>
          </div>
        </div>

        <!-- Right hand side is form controls -->
        <div class="tw-w-1/2">
          <div class="tw-justify-end">
          <container-graphic
          :geometry="containerGeometry"
          :containerType="plateType"
          :samples="samples"
          :key="plateKey"
          @cell-clicked="onContainerCellClicked"/>
          </div>
        </div>

      </form>


      <div class="tw-border tw-border-orange-500">
        <!-- Sample specific fields -->
        <sample-editor
          :sampleComponent="plateType"
          :capacity="containerGeometry.capacity"
          :selectedSample="selectedSample"
          :experimentKind="containerState.EXPERIMENTKINDID"
          :samplesCollection="samplesCollection"
          :proteins="proteinsCollection"
          :gproteins="gProteinsCollection"
          :automated="containerState.AUTOMATED"
          @select-sample="onSelectSample"
        />
        <!-- <div v-show="plate && containerGroup == 'scm'">
          <single-sample
            :proteins="proteins"
            v-model="sample"
            :experimentKind="sampleComponent">
            <!-- <template v-slot:experimentSampleMetaData>
              <component :is="sampleComponent" v-bind="{ name: experimentKind }"/>
            </template> -->
          <!-- </single-sample>
          <p>Protein selection: {{sample.PROTEINID}}</p>
          <p>Sample name: {{sample.NAME}}</p>
        </div> -->

        <!-- <div>
          <marionette-view
            v-if="ready"
            :key="$route.fullPath"
            :options="options"
            :fetchOnLoad="true"
            :mview="mview"
            :breadcrumbs="bc"/>
        </div> -->
      </div>

      <button name="submit" type="submit" class="button submit" :class="{ 'tw-border tw-border-red-500' : invalid}">Add Container</button>

    </div>

    </validation-observer>
  </div>
</template>

<script>
import Container from 'models/container'
import ContainerTypes from 'modules/shipment/collections/containertypes'
import ContainerRegistry from 'modules/shipment/collections/containerregistry'

import ExperimentTypes from 'modules/shipment/collections/experimenttypes'

import ProcessingPipelines from 'collections/processingpipelines'
import Users from 'collections/users'

import DistinctProteins from 'modules/shipment/collections/distinctproteins'

import SwSelectInput from 'app/components/forms/sw_select_input.vue'
import SwGroupSelectInput from 'app/components/forms/sw_group_select_input.vue'
import SwTextInput from 'app/components/forms/sw_text_input.vue'
import SwTextAreaInput from 'app/components/forms/sw_textarea_input.vue'
import SwCheckboxInput from 'app/components/forms/sw_checkbox_input.vue'

import ContainerGraphic from 'modules/shipment/components/ContainerGraphic.vue'

import Sample from 'models/sample'
import Samples from 'collections/samples'

import SingleSample from 'modules/shipment/components/samples/SingleSample.vue'
import SampleEditor from 'modules/shipment/components/samples/SampleEditor.vue'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

const EXPERIMENT_TYPE_ROBOT = 22
const EXPERIMENT_TYPE_HPLC = 21

const STORAGE_TEMP_NEG_80 = -80
const STORAGE_TEMP_0 = 0
const STORAGE_TEMP_25 = 25

const initialSampleState = {
  PROTEINID: '',
  CRYSTALID: '-1',
  TYPE: '',
  NAME: 'sample1',
  VOLUME: '1',
  COLUMN: '2',
  BUFFER: '3',
  SCORE: 1, // Proxy for valid
  LOCATION: '',
  ROBOTPLATETEMPERATURE: '',
  EXPOSURETEMPERATURE: ''
}

// Use Location as idAttribute for this table
var LocationSample = Sample.extend({
    idAttribute: 'LOCATION',
})

const initialContainerState = {
  DEWARID: "",
  BARCODECHECK: null,
  CAPACITY: 0,
  CONTAINERTYPE: null,
  PROCESSINGPIPELINEID: null,
  NAME: "",
  CONTAINERREGISTRYID: null,
  AUTOMATED: 0,
  BARCODE: "",
  PERSONID: null,
  EXPERIMENTTYPE: "",
  STORAGETEMPERATURE: "",
  COMMENTS: "",
  REQUESTEDIMAGERID: null,
  SCHEDULEID: null,
  SCREENID: null,
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
      automated: '',
      barCode: '',
      comments: '',
      containerName: '',

      containerState: initialContainerState,

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

      experimentType: '',
      experimentTypes: [],
      experimentTypesCollection: null,
      // experimentTypes: [
      //   {ID: 0, NAME: '-'},
      //   {ID: EXPERIMENT_TYPE_ROBOT, NAME: 'Robot'},
      //   {ID: EXPERIMENT_TYPE_HPLC, NAME: 'HPLC'},
      // ],

      containerRegistry: [],
      containerRegistryId: '',
      containerGroup: '',

      sample: initialSampleState,
      samples: [],
      samplesCollection: null,
      sampleComponent: '',
      sampleLocation: 1, // Currently active sample being edited

      selectedSample: null,

      storageTemperature: 0,
      storageTemperatures: [
        {ID: -1, NAME: '-'},
        {ID: STORAGE_TEMP_NEG_80, NAME: '-80'},
        {ID: STORAGE_TEMP_0, NAME: '0'},
        {ID: STORAGE_TEMP_25, NAME: '25'},
      ],

      plateKey: 0,
      plateType: null,
      // Used to show/hide fields
      puck: false,
      plate: false,

      processingPipeline: '',
      processingPipelines: [],


      proteinsCollection: null,
      gProteinsCollection: null,
      proteins: [],
      proteinSelection: null,

      showAllContainerTypes: false,
      showAllExperimentTypes: false,

      usersCollection: null,
      users: []
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
      console.log("Container type groups: " + JSON.stringify(groups))
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
      console.log("Experiment type groups: " + JSON.stringify(groups))
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
    }
  },

  watch: {
    sampleLocation: function(newLocation, oldLocation) {
      // Take what was saved in sample and store in array
      console.log("Temp save sample and use new location")
      if (!this.sample.name) this.sample.SCORE = 0
      this.samples.splice(oldLocation-1, 1, this.sample)
      this.samples[oldLocation-1].LOCATION = oldLocation
      let newState = this.samples[newLocation-1] || initialSampleState
      this.sample = Object.assign({}, this.sample, newState)

      this.samplesCollection.set( new LocationSample(newState), { remove: false })
      // Forces a plate re-render... TODO fix!
      this.plateKey += 1
    },
    'containerState.CONTAINERTYPE': function(newVal) {
      let type = this.containerTypesCollection.findWhere({CONTAINERTYPEID: newVal})
      // We can use the combination of plate/puck and proposal group to help determine which fields to show
      this.containerGroup = type.get('PROPOSALTYPE')
      console.log("Container Type changed: " + newVal)
      console.log("Container Type group: " + this.containerGroup)

      // All plates have a well per row value
      if (type.get('WELLPERROW') > 0) {
        this.puck = false
        this.plate = true
      } else {
        this.puck = true
        this.plate = false
      }

      console.log("Puck/plate Type: " + this.puck + ", " + this.plate)


      this.updateContainerGeometry(type.toJSON())
    },
    'containerState.EXPERIMENTTYPEID': function(newVal) {
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

    // Used to help show/hide fields
    this.containerGroup = this.$store.state.proposalType

    this.containerState.DEWARID = this.dewar.DEWARID

    this.samplesCollection = new Samples(null, {model: LocationSample})

    this.containerFilter = [this.$store.state.proposal.proposalType]
    this.experimentFilter = [this.$store.state.proposal.proposalType]

    this.containerTypesCollection = new ContainerTypes()
    let containerRegistryCollection = new ContainerRegistry(null, { state: { pageSize: 9999 }})

    this.experimentTypesCollection = new ExperimentTypes()

    this.proteinsCollection = new DistinctProteins()
    // If we want to only allow valid samples
    if (app.options.get('valid_components') && !app.staff) {
        this.proteinsCollection.queryParams.external = 1
    }

    this.gProteinsCollection = new DistinctProteins()
    // For now assume Green only
    // this.proteinsCollection.queryParams.SAFETYLEVEL = 'GREEN';

    let processingPipelinesCollection = new ProcessingPipelines()
    processingPipelinesCollection.queryParams.pipelinestatus = 'optional'
    processingPipelinesCollection.queryParams.category = 'processing'

    this.usersCollection = new Users(null, { state: { pageSize: 9999 }})
    this.usersCollection.queryParams.all = 1
    this.usersCollection.queryParams.pid = this.$store.state.proposal.proposalModel.get('PROPOSALID')

    this.$store.dispatch('get_collection', this.containerTypesCollection).then( (result) => {
      console.log("Container Types collection: " + result.toJSON())
      this.containerTypes = result.toJSON()
      this.containerType = this.containerTypes.length ? this.containerTypes[0]['CONTAINERTYPEID'] : ''
    })
    this.$store.dispatch('get_collection', this.experimentTypesCollection).then( (result) => {
      console.log("Experiment Types collection: " + result.toJSON())
      this.experimentTypes = result.toJSON()
      this.experimentType = this.experimentTypes.length ? this.experimentTypes[0]['EXPERIMENTTYPEID'] : ''
    })
    this.$store.dispatch('get_collection', containerRegistryCollection).then( (result) => {
      this.containerRegistry = result.toJSON()
      this.containerRegistry.unshift({CONTAINERREGISTRYID: 0, BARCODE: "-"})
    })
    this.$store.dispatch('get_collection', this.proteinsCollection).then( (result) => {
      console.log("Proteins = " + JSON.stringify(result))
      this.proteins = result.toJSON()
    })
    this.$store.dispatch('get_collection', processingPipelinesCollection).then( (result) => {
      this.processingPipelines = result.toJSON()
    })
    this.$store.dispatch('get_collection', this.usersCollection).then( (result) => {
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
        DEWARID: this.containerState.DEWARID,
        BARCODECHECK: null,
        CAPACITY: this.containerGeometry.capacity,
        CONTAINERTYPE: this.containerState.CONTAINERTYPE,
        PROCESSINGPIPELINEID: this.processingPipeline,
        NAME: this.containerState.NAME,
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
      this.saveContainer(containerModel)
      // Save the samples...
      console.log("addContainer: " + JSON.stringify(containerModel))
      console.log("Samples: " + JSON.stringify(this.samples))
    },

    saveContainer: function(model) {
      // this.$store.commit('loading', true)

      this.$store.dispatch('save_model', model).then( (result) => {
        let cid = model.get('CONTAINERID')
        console.log("Container Saved: " + JSON.stringify(result))
        console.log("Container ID = " + cid)
        this.$store.commit('add_notification', { message: 'New Container created, click <a href=/containers/cid/'+cid+'>here</a> to view it', level: 'info', persist: true})

        this.saveSamples(cid)
      }, (err) => {
        console.log("Error saving Container: " + err)
        this.$store.commit('add_notification', { message: 'Something went wrong creating this container, please try again', level: 'error'})
      }).finally( () => {
        // this.$store.commit('loading', false)
      })
    },

    saveSamples: function(cid) {
      // Save Samples
      // Loop through samples and set container id from model

      this.samplesCollection.each(function(s) {
          s.set({ CONTAINERID: cid }, { silent: true })
      }, this)

      var samples = new Samples(this.samplesCollection.filter(function(m) { return m.get('PROTEINID') > - 1 || m.get('CRYSTALID') > - 1 }))

      console.log("Full Samples list = " + JSON.stringify(this.samplesCollection))
      console.log("Filtered Samples list = " + JSON.stringify(samples))

      if (samples.length) {
        this.$store.dispatch('save_collection', samples).then( (result) => {
          console.log("Samples Saved " + JSON.stringify(result))
        }, () => {
          console.log("sample save error")
          this.$store.commit('add_notification', { message: 'Error saving samples', level: 'error'})
        })
      }
    },

    resetForm: function() {
      console.log("Reset Form data")
    },



    onContainerCellClicked: function(location) {
      console.log("Cell clicked = " + location)
      this.sampleLocation = location
    },
    checkBarcode: function() {
      console.log("Check Barcode: " + this.barCode)
      // if (!this.ui.barcode.val()) this.model.set('BARCODECHECK', null)
      // var self = this
      // Backbone.ajax({
      //     url: app.apiurl+'/shipment/containers/barcode/'+this.ui.barcode.val(),
      //     success: function(resp) {
      //         self.updateBarcode(resp.PROP)
      //     },

      //     error: function() {
      //         self.updateBarcode()
      //     }
      // })
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
        this.containerState.CONTAINERTYPE = geometry.NAME
        this.plateType = 'Plate'
      } else {
        this.plateType = 'Puck'
      }
      this.plateKey += 1
    }
  },
}
</script>