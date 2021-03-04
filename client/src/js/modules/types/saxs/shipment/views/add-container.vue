<template>
<!--
Add Container built initially for Saxs
Includes ability to select container type from any proposal type
Uses Container Graphic to show plate/pucks
Once container is valid then samples are added
-->
  <div class="content">
    <h1>Add Container Saxs style</h1>

      <div class="tw-flex tw-flex-col">

      <!-- Wrap the form in an observer component so we can check validation state on submission -->
      <validation-observer ref="observer" v-slot="{ invalid }">

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
            <sw-checkbox-input
              name="SHOW_ALL_CONTAINER_TYPES"
              v-model="showAllContainerTypes"
            />
          </div>

          <div class="tw-mb-2 tw-py-2">
            <sw-group-select-input
              v-model="containerState.CONTAINERTYPEID"
              label="Container Type"
              :groups="groupedContainerTypes"
              optionValueKey="CONTAINERTYPEID"
              optionTextKey="NAME"
              defaultText="Please select a container type"
            />
          </div>

          <validation-provider tag="div" class="tw-mb-2 tw-py-2" rules="required" name="name" v-slot="{ errors }">
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

          <div v-show="puck" class="autoprocessing_options tw-mb-2 tw-py-2">
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

          <div v-show="puck" class="pck tw-mb-2 tw-py-2">
            <label>Automated Collection</label>
            <sw-checkbox-input
              name="AUTOMATED"
              v-model="containerState.AUTOMATED"
            />
          </div>

          <validation-provider v-show="!puck" tag="div" class="pcr plate tw-mb-2 tw-py-2" rules="required" name="BARCODE" v-slot="{ errors }">  <sw-text-input
              label="Barcode"
              name="BARCODE"
              v-model="containerState.CODE"
              :errorMessage="errors[0]"
              />
          </validation-provider>

          <validation-provider tag="div" class="tw-mb-2 tw-py-2" rules="required" name="owner">
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
                <span v-show="!ownerEmail" class="emsg tw-bg-content-light-background tw-text-xxs tw-ml-1 tw-p-1 tw-h-6">Please update your email address by clicking view</span>
              </template>
              <template v-slot:actions>
                <a :href="'/contacts/user/'+containerState.PERSONID" class="button edit_user tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
              </template>
            </sw-select-input>
          </validation-provider>

          <div v-show="containerGroup == 'scm'" class="tw-mb-2 tw-py-2" >
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

          <div v-show="containerGroup == 'scm'" class="pcr tw-mb-2 tw-py-2">
            <sw-select-input
              v-model="containerState.STORAGETEMPERATURE"
              label="Storage Temperature"
              name="STORAGETEMPERATURE"
              :options="storageTemperatures"
              optionValueKey="ID"
              optionTextKey="NAME"
              />
          </div>

          <sw-text-input outerClass="tw-mb-2 tw-py-2" id="comments" v-model="containerState.COMMENTS" name="COMMENTS" description="Comment for the container" label="Comments"/>

          <!-- VMXi Plates... -->
          <div v-show="plate && containerGroup == 'mx'" class="plate tw-mb-2 tw-py-2">
              <label>Requested Imager
                  <span class="small">Imager this container should go into</span>
              </label>
              <select name="REQUESTEDIMAGERID"></select>
          </div>

          <div v-show="plate && containerGroup == 'mx'" class="plate tw-mb-2 tw-py-2">
              <label>Imaging Schedule
                  <span class="small">Requested imaging schedule</span>
              </label>
              <select name="SCHEDULEID" class="tw-h-6"></select> <a href="#" class="button view_sch tw-w-16 tw-text-center tw-h-6"><i class="fa fa-search"></i> View</a>
          </div>

          <div v-show="plate && containerGroup == 'mx'" class="plate tw-mb-2 tw-py-2">
              <label>Crystallisation Screen
                  <span class="small">Crystallisation screen that was used for this container</span>
              </label>
              <select name="SCREENID"></select>
          </div>
        </div>

        <!-- Right hand side is container graphic -->
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

     <!-- </validation-observer> -->

      <div>
        <!-- Sample specific fields -->
        <puck-controls v-show="plateType=='puck'"
          @clone-puck="clonePuck"
          @clear-puck="clearPuck"
          @autofill-puck="autofillPuck"
          @extra-puck="extraPuck" />

        <sample-editor
          :sampleComponent="plateType"
          :capacity="containerGeometry.capacity"
          :selectedSample="selectedSample"
          :experimentKind="containerState.EXPERIMENTTYPEID"
          :samplesCollection="samplesCollection"
          :proteins="proteinsCollection"
          :gproteins="gProteinsCollection"
          :automated="containerState.AUTOMATED"
          @select-sample="onSelectSample"
        />
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
import Container from 'models/container'
import ContainerGraphic from 'modules/shipment/components/ContainerGraphic.vue'
import ContainerTypes from 'modules/shipment/collections/containertypes'
import ContainerRegistry from 'modules/shipment/collections/containerregistry'

import DistinctProteins from 'modules/shipment/collections/distinctproteins'
import ExperimentTypes from 'modules/shipment/collections/experimenttypes'

import EventBus from 'app/components/utils/event-bus.js'
import Sample from 'models/sample'
import Samples from 'collections/samples'

import SingleSample from 'modules/shipment/components/samples/SingleSample.vue'
import SampleEditor from 'modules/shipment/components/samples/SampleEditor.vue'
import SwSelectInput from 'app/components/forms/sw_select_input.vue'
import SwGroupSelectInput from 'app/components/forms/sw_group_select_input.vue'
import SwTextInput from 'app/components/forms/sw_text_input.vue'
import SwTextAreaInput from 'app/components/forms/sw_textarea_input.vue'
import SwCheckboxInput from 'app/components/forms/sw_checkbox_input.vue'

import ProcessingPipelines from 'collections/processingpipelines'
import PuckControls from 'modules/shipment/components/samples/PuckSampleControls.vue'
import Users from 'collections/users'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

const STORAGE_TEMP_NEG_80 = -80
const STORAGE_TEMP_0 = 0
const STORAGE_TEMP_25 = 25

const INITIAL_SAMPLE_STATE = {
  BLSAMPLEID: null,
  PROTEINID: '-1',
  CRYSTALID: '-1',
  TYPE: '',
  NAME: '',
  VOLUME: '',
  PURIFICATIONCOLUMNID: '',
  BUFFER: '',
  LOCATION: '',
  ROBOTPLATETEMPERATURE: '',
  EXPOSURETEMPERATURE: '',
  EXPERIMENTTYPEID: '',
  valid: false,
}

// Use Location as idAttribute for this table
var LocationSample = Sample.extend({
    idAttribute: 'LOCATION',
    defaults: INITIAL_SAMPLE_STATE
})

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

export default {
  name: 'SaxsAddContainer',
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
    'puck-controls': PuckControls,
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

      experimentTypes: [],
      experimentTypesCollection: null,

      containerRegistry: [],
      containerRegistryId: '',
      containerGroup: '',

      sample: INITIAL_SAMPLE_STATE,
      samples: [],
      samplesCollection: null,
      sampleComponent: '',
      sampleLocation: 1, // Currently active sample being edited

      selectedSample: null,

      storageTemperature: 0,
      storageTemperatures: [
        {ID: '', NAME: '-'},
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
    }
  },

  watch: {
    showAllContainerTypes: function(newVal) {
      // Which container id should be selected
      if (newVal) this.containerState.CONTAINERTYPEID = "!"

    },
    sampleLocation: function(newLocation, oldLocation) {
      // Take what was saved in sample and store in array
      // Not currently used for plates...

      if (!this.sample.name) this.sample.SCORE = 0
      this.samples.splice(oldLocation-1, 1, this.sample)
      this.samples[oldLocation-1].LOCATION = oldLocation
      let newState = this.samples[newLocation-1] || INITIAL_SAMPLE_STATE
      this.sample = Object.assign({}, this.sample, newState)

      // Forces a plate re-render... TODO fix!
      this.plateKey += 1
    },
    // When the container type changes we need to reset the samples list and redraw the container graphic
    'containerState.CONTAINERTYPEID': function(newVal) {
      console.log("Container Type ID has changed: " + newVal)
      let type = this.containerTypesCollection.findWhere({CONTAINERTYPEID: newVal})

      if (!type) {
        console.log("Could not find container type: " + newVal)
        return
      }
      this.containerState.CONTAINERTYPE = type.get('NAME')
      this.containerGroup = type.get('PROPOSALTYPE')

      // All plates have a well per row value
      if (type.get('WELLPERROW') > 0) {
        this.puck = false
        this.plate = true
      } else {
        this.puck = true
        this.plate = false
      }

      this.updateContainerGeometry(type.toJSON())
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

    this.$store.dispatch('getCollection', this.containerTypesCollection).then( (result) => {
      this.containerTypes = result.toJSON()
      // Do we have valid start state?
      if (this.containerTypes.length) {
        let first = result.findWhere({PROPOSALTYPE: this.containerFilter[0]})
        if (first) this.containerState.CONTAINERTYPEID =  first.get('CONTAINERTYPEID')
      }
    })
    this.$store.dispatch('getCollection', this.experimentTypesCollection).then( (result) => {
      this.experimentTypes = result.toJSON()
      this.containerState.EXPERIMENTTYPEID = this.experimentTypes.length ? this.experimentTypes[0]['EXPERIMENTTYPEID'] : ''
    })
    this.$store.dispatch('getCollection', containerRegistryCollection).then( (result) => {
      this.containerRegistry = result.toJSON()
      this.containerRegistry.unshift({CONTAINERREGISTRYID: 0, BARCODE: "-"})
    })
    this.$store.dispatch('getCollection', this.proteinsCollection).then( (result) => {
      this.proteins = result.toJSON()
    })
    this.$store.dispatch('getCollection', processingPipelinesCollection).then( (result) => {
      this.processingPipelines = result.toJSON()
    })
    this.$store.dispatch('getCollection', this.usersCollection).then( (result) => {
      this.users = result.toJSON()
      // Set plate owner to current user
      this.containerState.PERSONID = this.$store.state.user.personId
    })
  },

  methods: {
    // Called on Add Container
    // Calls the validation method on our observer component
    onSubmit: function() {
      this.$refs.observer.validate().then( (result) => {
        if (result) this.addContainer()
        else console.log("Form validation failed ")
      })
    },
    addContainer: function() {
      let experimentType = this.experimentTypesCollection.findWhere({EXPERIMENTTYPEID: this.containerState.EXPERIMENTTYPEID})

      let containerModel = new Container({
        DEWARID: this.containerState.DEWARID,
        BARCODECHECK: null,
        CAPACITY: this.containerGeometry.capacity,
        CONTAINERTYPE: this.containerState.CONTAINERTYPE,
        PROCESSINGPIPELINEID: this.containerState.PROCESSINGPIPELINEID,
        NAME: this.containerState.NAME,
        CONTAINERREGISTRYID: this.containerState.CONTAINERREGISTRYID,
        AUTOMATED: this.containerState.AUTOMATED,
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
        console.log("Container Saved: " + JSON.stringify(result))
        console.log("Container ID = " + cid)
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
      console.log("Resetting Samples Collection, capacity: " + capacity)
      var samples = Array.from({length: capacity}, (_,i) => new LocationSample({ BLSAMPLEID: null, LOCATION: (i+1).toString(), PROTEINID: -1, CRYSTALID: -1, new: true }))

      this.samplesCollection.reset(samples)
    },

    onContainerCellClicked: function(location) {
      console.log("Cell clicked = " + location)
      // Unset the previous selected sample
      if (this.sampleLocation) {
        let previousSample = this.samplesCollection.findWhere({LOCATION: this.sampleLocation.toString()})
        if (previousSample) previousSample.set('isSelected', false)
      }
      // Now set the currently selected sample
      this.sampleLocation = location

      let sample = this.samplesCollection.findWhere({LOCATION: location.toString()})

      if (sample) sample.set('isSelected', true)
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
        this.plateType = this.containerGeometry.capacity > 25 ? 'single-sample-plate' : 'sample-plate'
      } else {
        this.plateType = 'puck'
      }
      this.plateKey += 1
    },
    clearPuck: function() {
      console.log('clear-puck')
      app.trigger('samples:clear-puck')
      this.resetSamples(this.samplesCollection.length)
      EventBus.$emit('samples-clear')
    },
    clonePuck: function() {
      console.log('clone-puck')
      app.trigger('samples:clone-puck')
    },
    extraPuck: function() {
      console.log('extra-puck')
      app.trigger('samples:extra-puck')
    },
    autofillPuck: function() {
      console.log('auto-puck')
      app.trigger('samples:autofill-puck')
    },
  },
}
</script>