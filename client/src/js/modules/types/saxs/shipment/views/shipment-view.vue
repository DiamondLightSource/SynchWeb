<template>
  <div class="content">
    <h1>SCM Shipment: <span class="SHIPPINGNAME">{{shipment.SHIPPINGNAME}}</span></h1>

    <p class="help">This page shows details and contents of the selected shipment. Most parameters can be edited by simply clicking on them.</p>
    <p class="help excl">Shipments need to have an outgoing and return home lab contact before shipment labels can be printed</p>

    <!-- Sets of buttons that relate to the shipment -->
    <div v-if="shipment.DHL_ENABLE">
        <div v-if="shipment.DELIVERYAGENT_HAS_LABEL == '1'">
            <p class="message notify">You can print your Airway Bill by clicking &quot;Print Airway Bill&quot; below</p>
        </div>
        <div v-else>
            <p class="message notify">You can now book your shipment with DHL using &quot;Create Airway Bill&quot; below</p>
        </div>
    </div>

    <div v-if="shipment.LCOUT && shipment.LCRET">
      <div class="ra">
        <a v-if="markAsSent" @click="onMarkAsSent" class="button send" href="#"><i class="fa fa-plane"></i> Mark as Sent</a>

        <span v-if="DHL_ENABLE">
          <span v-if="DELIVERYAGENT_HAS_LABEL == '1'">
            <a class="button pdf" :href="APIURL+'/pdf/awb/sid/'+shipment.SHIPPINGID" @click="onPrintPdf"><i class="fa fa-print"></i> Print Airway Bill</a>
            <!-- 
              This button was commented out in the original shipment template
              <a class="button cancel" href="#"><i class="fa fa-truck"></i> Cancel Pickup</a>
            -->
            <span v-if="!DELIVERYAGENT_PICKUPCONFIRMATION">
                <a class="button awb" :href="'/shipments/pickup/sid/'+shipment.SHIPPINGID"><i class="fa fa-truck"></i> Rebook Pickup</a>
            </span>
          </span>

          <span v-else>
            <a class="button awb" :href="'/shipments/awb/sid/'+shipment.SHIPPINGID"><i class="fa fa-credit-card"></i> Create Airway Bill</a>
          </span>
        </span>

        <a :href="APIURL+'/pdf/sid/'+shipment.SHIPPINGID+'/prop/'+shipment.PROP" class="label button pdf" title="Print Shipment Labels" @click="onPrintPdf"><i class="fa fa-print"></i> Print Shipment Labels</a>
        <a :href="APIURL+'/pdf/container/sid/'+shipment.SHIPPINGID+'/prop/'+shipment.PROP" class="label button pdf" title="Print Shipment Contents" @click="onPrintPdf"><i class="fa fa-print"></i> Print Contents</a>
      </div>
    </div>

    <!-- Display Shipment information and allow editing some fields -->
    <div class="form vform">
        <ul>

            <li>
                <span class="label">Created</span>
                <span class="created">{{shipment.CREATED}}</span>
            </li>

            <li>
                <span class="label">Status</span>
                <span class="stat">{{shipment.SHIPPINGSTATUS}}</span>
            </li>

            <li>
                <!--
                  Lab contact renders the lab contact card name but saves the id.
                  So we need to update LCOUT after a change
                -->
                <span class="label">Outgoing Lab Contact</span>
                <base-input-select
                  :inline="true"
                  :initialText="shipment.LCOUT"
                  v-model="shipment.SENDINGLABCONTACTID"
                  :options="labContacts"
                  optionValueKey="LABCONTACTID"
                  optionTextKey="CARDNAME"
                  @save="onChangeLabContact('LCOUT', $event)"/>
            </li>

            <li>
                <!--
                  Lab contact renders the lab contact card name but saves the id.
                  So we need to update LCRET after a change
                -->
                <span class="label">Return Lab Contact</span>
                <base-input-select
                  :inline="true"
                  :initialText="shipment.LCRET"
                  v-model="shipment.RETURNLABCONTACTID"
                  :options="labContacts"
                  optionValueKey="LABCONTACTID"
                  optionTextKey="CARDNAME"
                  @save="onChangeLabContact('LCRET', $event)"/>
            </li>

            <li>
                <!--
                  For safety level the text is the same as the value
                  So we don't need to pass any special initial text for inline display
                -->
                <span class="label">Safety Level</span>
                <base-input-select
                  :inline="true"
                  v-model="shipment.SAFETYLEVEL"
                  :options="[{'NAME':'Green', 'ID': 'Green'}, {'NAME':'Yellow', 'ID': 'Yellow'}, {'NAME':'Red', 'ID': 'Red'}]"
                  optionValueKey="ID"
                  optionTextKey="NAME"
                  @save="save('SAFETYLEVEL')"/>
            </li>

            <li>
                <span class="label">Courier</span>
                <base-input-text :inline="true" v-model="shipment.DELIVERYAGENT_AGENTNAME" @save="save('DELIVERYAGENT_AGENTNAME')"/>
            </li>
            <li>
                <span class="label">Courier Account No.</span>
                <base-input-text :inline="true" v-model="shipment.DELIVERYAGENT_AGENTCODE" @save="save('DELIVERYAGENT_AGENTCODE')"/>
            </li>

            <li>
                <span class="label">Shipping Date</span>
                <base-input-date :inline="true" id="shipping-date" v-model="shipment.DELIVERYAGENT_SHIPPINGDATE" name="DELIVERYAGENT_SHIPPINGDATE" @save="save('DELIVERYAGENT_SHIPPINGDATE')"/>
            </li>

            <li>
                <span class="label">Shipping Airway Bill</span>
                <base-input-text :inline="true" v-model="shipment.DELIVERYAGENT_FLIGHTCODE" @save="save('DELIVERYAGENT_FLIGHTCODE')"/>
            </li>

            <li>
                <span class="label">Shipping Pickup Location</span>
                <base-input-text :inline="true" v-model="shipment.PHYSICALLOCATION" @save="save('PHYSICALLOCATION')"/>
            </li>

            <li>
                <span class="label">Shipping Ready By</span>
                <base-input-time :inline="true" id="ready-by" v-model="shipment.READYBYTIME" @save="save('READYBYTIME')"/>
            </li>

            <li>
                <span class="label">Shipping Close Time</span>
                <base-input-time :inline="true" id="close-time" v-model="shipment.CLOSETIME" @save="save('CLOSETIME')"/>
            </li>

            <div v-if="shipment.DELIVERYAGENT_PICKUPCONFIRMATION">
              <li>
                  <span class="label">Shipping Pickup Confirmed</span>
                  Yes - Confirmation Number: <span class="DELIVERYAGENT_PICKUPCONFIRMATION">{{shipment.DELIVERYAGENT_PICKUPCONFIRMATION}}</span>
                  <a href="#" class="button cancel_pickup" @click="onCancelPickup"><i class="fa fa-times"></i> Cancel</a>
              </li>
              <li>
                  <span class="label">Shipping Confirmed Ready By</span>
                  <span class="DELIVERYAGENT_READYBYTIME">{{shipment.DELIVERYAGENT_READYBYTIME}}</span>
              </li>

              <li>
                  <span class="label">Shipping Confirmed Call In</span>
                  <span class="DELIVERYAGENT_CALLINTIME">{{shipment.DELIVERYAGENT_CALLINTIME}}</span>
              </li>
            </div>

            <li>
                <span class="label">Estimated Delivery Date</span>
                <base-input-date :inline="true" id="delivery-date" v-model="shipment.DELIVERYAGENT_DELIVERYDATE" name="DELIVERYAGENT_DELIVERYDATE" @save="save('DELIVERYAGENT_DELIVERYDATE')"/>
            </li>

            <li>
                <span class="label">Comments Area</span>
                <base-input-textarea :inline="true" v-model="shipment.COMMENTS" outerClass="tw-w-1/2" @save="save('COMMENTS')"/>
            </li>
        </ul>
        <div class="clear"></div>
    </div>


    <h1>Shipment Contents</h1>

    <p class="help">Select a dewar by clicking on the row in the table below. Package details are then shown below. Click the + icon to add a container to the selected package</p>

    <div class="ra"><a v-if="PROPOSAL_ACTIVE" href="#" class="button" id="add_dewar" title="Add a package to this shipment" @click.prevent="onAddDewar"><i class="fa fa-plus"></i> Add Item to Shipment</a></div>

    <validation-observer ref="dewarsObserver">
    <!--
      List of dewars/parcels within this shipment
      The user can add a dewar/parcel to this list by clicking on Add Item to shipment.
      If that happens we add a row to the dewar list and enable the form to edit that dewar
    -->
    <table-component
      :headers="dewarTableHeaders"
      :data="dewars"
      :actions="'Actions'"
      @row-clicked="onShowDewar"
    >
      <template slot="content" slot-scope="{ row, rowIndex }">
        <td>
          <validation-provider v-if="isEditingRowIndex(rowIndex)" slim rules="required" v-slot="{ errors }">
            <base-input-text v-model="newDewar['CODE']" :quiet="true" :errorMessage="errors[0]"/>
          </validation-provider>
          <span v-else>{{row['CODE']}}</span>
        </td>
        <td>
          <span>{{row['BARCODE']}}</span>
        </td>
        <td>
          <validation-provider v-if="isEditingRowIndex(rowIndex)" slim :rules="{required: false, regex:'^[a-zA-Z]{3}-[a-zA-Z]{2}-[0-9]+$'}" v-slot="{ errors }">
            <base-input-text v-model="newDewar['FACILITYCODE']" :quiet="true" :errorMessage="errors[0]"/>
          </validation-provider>
          <span v-else>{{row['FACILITYCODE']}}</span>
        </td>
        <td>
          <validation-provider v-if="isEditingRowIndex(rowIndex)" slim rules="required|numeric" v-slot="{ errors }">
            <base-input-text v-model="newDewar['WEIGHT']" :quiet="true" :errorMessage="errors[0]"/>
          </validation-provider>
          <span v-else>{{row['WEIGHT']}}</span>
        </td>
        <td>
          <validation-provider v-if="isEditingRowIndex(rowIndex)" slim rules="required|numeric|min_value:1" v-slot="{ errors }">
            <!-- <base-input-text v-model="newDewar['FIRSTEXPERIMENTID']" :quiet="true" :errorMessage="errors[0]"/> -->
            <base-input-select
              v-model="newDewar['FIRSTEXPERIMENTID']"
              :options="visits"
              optionValueKey="SESSIONID"
              optionTextKey="VISITDETAIL"
              defaultText="Please select a visit"
              defaultValue="0"
              :errorMessage="errors[0]">
            </base-input-select>
          </validation-provider>
          <span v-else>{{getVisitDetail(row['FIRSTEXPERIMENTID'])}}</span>
        </td>
        <td>
          <span>{{row['TRACKINGNUMBERTOSYNCHROTRON']}}</span>
        </td>
        <td>
          <span>{{row['TRACKINGNUMBERFROMSYNCHROTRON']}}</span>
        </td>
        <td>
          <span>{{row['DEWARSTATUS']}}</span>
        </td>
        <td>
          <span>{{row['STORAGELOCATION']}}</span>
        </td>
        <td>
          <span>{{row['CCOUNT']}}</span>
        </td>
      </template>

      <template slot="actions" slot-scope="{ row, rowIndex }">
        <div v-if="isEditingRowIndex(rowIndex)">
          <a class="button" href="" @click.prevent="onSaveDewar"><i class="fa fa-check"></i></a>
          <a class="button" href="" @click.prevent="onCancelAddDewar"><i class="fa fa-times"></i></a>
        </div>
        <div v-else>
          <a class="button" href="#" @click.prevent="onEditDewar(rowIndex)"><i class="fa fa-pencil"></i></a>
          <a class="button" :href="APIURL+'/pdf/container/did/'+row.DEWARID+'/prop/'+PROPOSAL" @click="onPrintPdf"><i class="fa fa-print "></i></a>
          <a class="button" :href="'/containers/add/did/'+row.DEWARID"><i class="fa fa-plus"></i></a>
          <a class="button" :href="'/dewars/dispatch/'+row.DEWARID"><i class="fa fa-home"></i></a>
          <a class="button" :href="'/dewars/transfer/'+row.DEWARID"><i class="fa fa-arrows-h"></i></a>
        </div>
      </template>
    </table-component>
    </validation-observer>

    <h1>
        Package Details: {{currentDewarName}}
        <!-- 
          Add Container Button (1)
          Old style large add container button
        -->
        <span v-if="PROPOSAL_ACTIVE" class="r padded_button add_container">
          <router-link class="button" :to="'/containers/add/did/'+currentDewarId"><i class="fa fa-plus"></i> Add Container</router-link>
        </span>
    </h1>

    <p class="help">This section shows contents and history for the selected package. Click the spyglass icon to view the contents of the container</p>

    <!--
      Add Container Button (2)
      Tailwind style - makes the Add Container button to be consistent with Add Dewar
    -->
    <!-- 
      <div class="tw-flex tw-justify-end tw-my-2">
        <span class="r padded_button add_container">
          <span v-if="PROPOSAL_ACTIVE" class="r padded_button add_container">
            <router-link class="button" :to="'/containers/add/did/'+currentDewarId"><i class="fa fa-plus"></i> Add Container</router-link>
          </span>
        </span>
      </div>
    -->

    <div class="tw-flex tw-flex-col sm:tw-flex-row">
      <!--
        Show Contents of the selected Dewar/Parcel
      -->
      <div class="tw-w-full sm:tw-w-1/2 sm:tw-mr-2 dcontent">
        <ul class="containers">
          <li v-for="container in containers" :key="container.CONTAINERID">
            {{container.NAME}} ({{container.SAMPLES}} Samples)

            <span class="r">
              <a class="button button-notext print" title="Click to print container contents" :href="APIURL+'/pdf/container/cid/'+container.CONTAINERID+'/prop/'+PROPOSAL" @click="onPrintPdf"><i class="fa fa-print"></i> <span>Print Container Report</span></a>
              <a class="button button-notext view" title="Click to View Container" :href="'/containers/cid/'+container.CONTAINERID"><i class="fa fa-search"></i> <span>View Container</span></a>
              <a href="#" class="button button-notext move" @click.prevent="onMoveContainer(container.CONTAINERID)"><i class="fa fa-arrows"></i> <span>Move Container</span></a>
            </span>

          </li>

          <li v-if="containers.length < 1">No containers found</li>
        </ul>
        <pagination-component @page-changed="onUpdateContent" :totalRecords="containersTotal" :initialPage="1" :pageLinks="5" :pageSizes="[5,10,20]"/>
      </div>

      <!--
        Show History of the selected Dewar/Parcel
      -->
      <div class="tw-w-full sm:tw-w-1/2 sm:tw-ml-2">
          <div class="sm:tw-flex sm:tw-flex-col">
              <div class="history table table-no-margin">
                <table-component
                :headers="dewarHistoryHeaders"
                :data="dewarHistory"
                noDataText="No history available"/>
                <pagination-component @page-changed="onUpdateHistory" />
              </div>
              <div class="form">
                <ul>
                  <li>
                    <span class="label">Origin</span>
                    <span class="origin">{{dewarTracking.ORIGIN}}</span>
                  </li>
                  <li>
                    <span class="label">Destination</span>
                    <span class="destination">{{dewarTracking.DESTINATION}}</span>
                  </li>
                </ul>
              </div>
              <div class="tracking table table-no-margin">
                <table-component
                :headers="dewarTrackingHeaders"
                :data="dewarTracking"
                noDataText="No tracking available"/>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>

import LabContactsCollection from 'collections/labcontacts'
import Container from 'models/container'
import Containers from 'collections/containers'

import Dewar from 'models/dewar'
import Dewars from 'collections/dewars'
import DewarHistory from 'modules/shipment/collections/dewarhistory'
import DewarTracking from 'modules/shipment/collections/dhl-tracking'

import MoveContainerView from 'modules/shipment/views/movecontainer'
// Utils contains confirmation dialog
import utils from 'utils'
import Backbone from 'backbone'

import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputDate from 'app/components/base-input-date.vue'
import BaseInputTime from 'app/components/base-input-time.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'

import TableComponent from 'app/components/table.vue'
import PaginationComponent from 'app/components/pagination.vue'

import VisitsCollection from 'collections/visits'

import { ValidationProvider, ValidationObserver }  from 'vee-validate'
import { mapState } from 'vuex'

const INITIAL_DEWAR_STATE = {
  SHIPPINGID: '',
  CODE: '',
  FACILITYCODE: '',
  WEIGHT: '',
  FIRSTEXPERIMENTID: ''
}

export default {
  name: 'SaxsShipmentView',
  components: {
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-time': BaseInputTime,
    'base-input-date': BaseInputDate,
    'base-input-select': BaseInputSelect,
    'table-component': TableComponent,
    'pagination-component': PaginationComponent,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver,
  },
  props: {
    // The Shipment model will be passed into this page
    model: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      addingNewDewar: false,
      newDewar: INITIAL_DEWAR_STATE,
      editingDewarIndex: null,

      labContacts: [],

      dewarTableHeaders: [
        {key: 'CODE', title: 'Name'},
        {key: 'BARCODE', title: 'Barcode'},
        {key: 'FACILITYCODE', title: 'FacilityCode'},
        {key: 'WEIGHT', title: 'Weight (Kg)'},
        {key: 'FIRSTEXPERIMENTID', title: 'First Experiment'},
        {key: 'TRACKINGNUMBERTOSYNCHROTRON', title: 'Tracking # to'},
        {key: 'TRACKINGNUMBERFROMSYNCHROTRON', title: 'Tracking # from'},
        {key: 'DEWARSTATUS', title: 'Status'},
        {key: 'STORAGELOCATION', title: 'Location'},
        {key: 'CCOUNT', title: 'Containers'}
      ],
      dewars: [],
      dewarsCollection: null,
      currentDewarId: null,
      currentDewarName: null,

      dewarHistory: [],
      dewarHistoryHeaders: [
        {key: 'DATE', title: 'Date'},
        {key: 'DEWARSTATUS', title: 'Status'},
        {key: 'STORAGELOCATION', title: 'Location'},
      ],
      dewarHistoryTotal: 0,

      dewarTracking: [],
      dewarTrackingHeaders: [
        {key: 'DATE', title: 'Date'},
        {key: 'DEWARSTATUS', title: 'Status'},
        {key: 'STORAGELOCATION', title: 'Location'},
        {key: 'SIGNATORY', title: 'Signatory'},
      ],
      containers: [],
      containersTotal: 0,

      shipment: {}, // JSON representation of the Shipping Backbone model
      visits: [],
      visitsCollection: null
    }
  },

  computed: {
    PROPOSAL_ACTIVE: function() {
      let isActive = this.proposalModel ? this.proposalModel.get('ACTIVE') : '0'
      if (isActive == '1') return true
      else return false
    },
    DHL_ENABLE: function() {
      return app.options.get('dhl_enable')
    },
    DHL_LINK: function() {
      return app.options.get('dhl_link')
    },
    markAsSent: function() {
      return this.shipment.SHIPPINGSTATUS == 'opened' || this.shipment.SHIPPINGSTATUS == 'awb created' || this.shipment.SHIPPINGSTATUS == 'pickup booked'
    },
    ...mapState({ 'APIURL': 'apiUrl'}),
    ...mapState('proposal', { 'proposalModel': 'proposalModel', 'PROPOSAL': 'proposal' })
  },

  created: function() {
    // Marshall the model into JSON so we can use v-model on its attributes
    this.shipment = Object.assign({}, this.model.toJSON())
    this.getDewars()
    this.getLocalContacts()
    this.getVisits()
  },
  watch: {
    currentDewarId: function(newId) {
      // When the currently selected dewar changes we need to update the history, container list (contents) and tracking tables
      this.getDewarHistory(newId)
      this.getDewarContents(newId)
      this.getDewarTrackingInformation(newId)
    },
  },

  methods: {
    onAddDewar: function() {
      this.newDewar = INITIAL_DEWAR_STATE
      this.addingNewDewar = true

      this.dewars.push(INITIAL_DEWAR_STATE)
      this.editingDewarIndex = this.dewars.length - 1
    },
    // Using cancel add for editing as well
    onCancelAddDewar: function() {
      if (this.addingNewDewar) {
        this.addingNewDewar = false
        this.dewars.pop()
      } else {
        this.editingDewarIndex = null
      }
      this.newDewar = Object.assign({}, INITIAL_DEWAR_STATE)
    },
    onEditDewar: function(index) {
      this.newDewar = Object.assign({}, this.dewars[index])
      this.editingDewarIndex = index
    },
    onSaveDewar: function() {
      this.$refs.dewarsObserver.validate().then( (result) => {
        if (result) this.saveDewar()
        else this.$store.commit('notifications/addNotification', {title: 'Error', message: 'Form validation failed, please edit the dewar fields and try again', level: 'error'})
      })
    },
    saveDewar: function() {
      this.newDewar.SHIPPINGID = this.shipment.SHIPPINGID 

      let attributes = {}

      // If we are updating an existing model, set the attributes we are changing
      if (this.newDewar.DEWARID) {
        Object.keys(INITIAL_DEWAR_STATE).forEach( (item) => {
          attributes[item] = this.newDewar[item]
        })
      }

      let dewarModel = new Dewar(this.newDewar)
      // If a new dewar - set the type (Assumes parcel for saxs)
      if (!this.newDewar.DEWARID) dewarModel.set('DEWAR_TYPE', 'Parcel')

      this.$store.dispatch('saveModel', { model: dewarModel, attributes: attributes }).then( (result) => {
        this.addingNewDewar = false
        this.editingDewarIndex = null
        this.newDewar = INITIAL_DEWAR_STATE
        this.getDewars()
      })
    },
    // Effetively a patch request to update specific fields
    // Saves the shipment model
    save: function(parameter) {
      let params = {}
      params[parameter] = this.shipment[parameter]

      this.$store.dispatch('saveModel', {model: this.model, attributes: params})
    },

    onShowDewar: function(dewar) {
      // Had some issues with scope of the passed object.
      // So set the currently selected dewar here and then watch the value for changes
      let dewarId = +dewar['DEWARID']
      // Don't proceed unless there is a valid DEWARID
      if (!dewarId) return

      // If we have selected the same dewar ignore
      this.currentDewarId = dewarId
      this.currentDewarName = dewar['CODE']
    },

    onUpdateContent: function(payload) {
      this.getDewarContents(this.currentDewarId, payload)
    },

    onUpdateHistory: function(payload) {
      this.getDewarHistory(this.currentDewarId, payload)
    },

    getDewarHistory: function(dewarId, paging=null) {
      let pagingState = paging || {}
      let dewarHistory = new DewarHistory( null, {state: pagingState})
      dewarHistory.id = dewarId

      this.$store.dispatch('getCollection', dewarHistory).then( (result) => {
        this.dewarHistory = result.toJSON()
        this.dewarHistoryTotal = result.state.totalRecords
      })
    },

    onChangeLabContact: function(lc, value) {
      // lc should be LCOUT or LCRET for shipment
      // Because - reasons - the actual values are RETURNLABCONTACTID and SENDINGLABCONTACTID
      // This updates the text displayed in the form as well as saving the model
      let labcontact = this.labContactsCollection.findWhere({LABCONTACTID: value})
      this.shipment[lc] = labcontact.get('CARDNAME')
      if (lc == 'LCRET') {
        this.save('RETURNLABCONTACTID')
      }
      if (lc == 'LCOUT') {
        this.save('SENDINGLABCONTACTID')
      }
    },
    onCancelPickup: function(e) {
      e.preventDefault()

      utils.confirm({
        title: 'Cancel Pickup',
        content: 'Are you sure you want to cancel this pickup? This cannot be undone',
        callback: this.doCancelPickup
      })
    },
    doCancelPickup: function() {
      var self = this

      Backbone.ajax({
        type: 'DELETE',
        url: app.apiurl+'/shipment/pickup/cancel/'+this.model.get('SHIPPINGID'),
        success: function() {
          self.model.set('DELIVERYAGENT_PICKUPCONFIRMATION', null)
          self.$store.commit('notifications/addNotification', { message: 'Pickup Cancelled', level: 'success' })
        },

        error: function(xhr, status, error) {
          var json;
          if (xhr.responseText) {
              try {
                json = $.parseJSON(xhr.responseText)
              } catch(err) {
                console.log("Error cancelling pickup?")
              }
            }
            self.$store.commit('notifications/addNotification', { title: 'Pickup Request Failed:', message: json.message, level: 'error' })
        }
      })
    },

    onMarkAsSent: function(e) {
      e.preventDefault()
      var self = this
      Backbone.ajax({
        url: app.apiurl+'/shipment/send/'+this.model.get('SHIPPINGID'),
        success: function() {
          self.model.set({ SHIPPINGSTATUS: 'send to facility' })
          self.$store.commit('notifications/addNotification', { level: 'success', message: 'Shipment successfully marked as sent' })
        },
        error: function() {
          self.$store.commit('notifications/addNotification', { message: 'Something went wrong sending this shipment, please try again', level: 'error' })
        },
      })
    },

    // Delegate pdf print to sign handler...
    onPrintPdf: function(e) {
      e.preventDefault()
      utils.signHandler(e)
    },

    onMoveContainer: function(id) {
      let self = this
      let container = new Container({CONTAINERID: id})

      this.$store.dispatch('getModel', container).then( (result) => {
        app.dialog.show(new MoveContainerView({ model: result }))
        app.on('container:moved', function() {
          self.getDewars()
          self.getDewarContents(self.currentDewarId)
        })
      })
    },

    getLocalContacts: function() {
      if (!this.labContactsCollection) this.labContactsCollection = new LabContactsCollection(null, { state: { pageSize: 9999 } })

      this.$store.dispatch('getCollection', this.labContactsCollection).then( (result) => {
        this.labContacts = result.toJSON()
      })
    },
    // Get the dewars/packages from this shipment
    getDewars: function() {
      if (!this.dewarsCollection) this.dewarsCollection = new Dewars(null, { id: this.model.get('SHIPPINGID') })

      this.$store.dispatch('getCollection', this.dewarsCollection).then( (result) => {
        this.dewars = result.toJSON()
        // If this is first time, select the first dewar in the list.
        if (this.currentDewarId == null && this.dewars.length > 0) {
          this.currentDewarId = this.dewars[0].DEWARID
          this.currentDewarName = this.dewars[0].CODE
        }
      })
    },
    getDewarTrackingInformation: function(dewarId) {
      // Grab sort tracking as well
      let dewartracking = new DewarTracking()
      var d = this.dewarsCollection.findWhere({ DEWARID: dewarId })

      if (d && (d.get('TRACKINGNUMBERTOSYNCHROTRON') || d.get('TRACKINGNUMBERTOSYNCHROTRON'))) {
          dewartracking.queryParams.DEWARID = dewarId

          this.$store.dispatch('getCollection', dewartracking).then( (result) => {
            this.dewarTracking = result.toJSON()
          })
      } else {
          this.dewarTracking = Object.assign({}, {ORIGIN: 'N/A', DESTINATION: 'N/A'})
      }
    },
    getDewarContents: function(dewarId, paging=null) {
      let pagingState = paging || { pageSize: 5}
      
      let dewarContent = new Containers(null, {state: pagingState})
      dewarContent.dewarID = dewarId
      dewarContent.setSorting('NAME')

      this.$store.dispatch('getCollection', dewarContent).then( (result) => {
        this.containers = result.toJSON()
        this.containersTotal = result.state.totalRecords
      })
    },
    getVisits: function() {
      if (!this.visitsCollection) this.visitsCollection = new VisitsCollection(null, { queryParams: { next: 1 }, state: { pageSize: 9999 } })

      this.$store.dispatch('getCollection', this.visitsCollection).then( (result) => {
        this.visits = result.toJSON()
      }, () => {
        self.$store.commit('notifications/addNotification', { message: 'Error retrieving visits', level: 'error' })
      })
    },
    getVisitDetail: function(id) {
      let visit = this.visitsCollection.findWhere({SESSIONID: id})
      return visit ? visit.get('VISIT') : ''
    },
    isEditingRowIndex: function(index) {
      return index == this.editingDewarIndex
    }
  },
}
</script>

