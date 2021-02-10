<template>
  <div class="content">
    <h1>Shipment: <span class="SHIPPINGNAME">{{shipment.SHIPPINGNAME}}</span></h1>

    <p class="help">This page shows details and contents of the selected shipment. Most parameters can be edited by simply clicking on them.</p>
    <p class="help excl">Shipments need to have an outgoing and return home lab contact before shipment labels can be printed</p>

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
            <a class="button pdf" :href="shipment.APIURL+'/pdf/awb/sid/'+shipment.SHIPPINGID"><i class="fa fa-print"></i> Print Airway Bill</a>
            <!-- <a class="button cancel" href="#"><i class="fa fa-truck"></i> Cancel Pickup</a> -->
            <span v-if="!DELIVERYAGENT_PICKUPCONFIRMATION">
                <a class="button awb" :href="'/shipments/pickup/sid/'+shipment.SHIPPINGID"><i class="fa fa-truck"></i> Rebook Pickup</a>
            </span>
          </span>

          <span v-else>
            <a class="button awb" :href="'/shipments/awb/sid/'+shipment.SHIPPINGID"><i class="fa fa-credit-card"></i> Create Airway Bill</a>
          </span>

        </span>

        <a :href="shipment.APIURL+'/pdf/sid/'+shipment.SHIPPINGID+'/prop/'+shipment.PROP" class="label button pdf" title="Print Shipment Labels"><i class="fa fa-print"></i> Print Shipment Labels</a>

        <a :href="shipment.APIURL+'/pdf/container/sid/'+shipment.SHIPPINGID+'/prop/'+shipment.PROP" class="label button pdf" title="Print Shipment Contents"><i class="fa fa-print"></i> Print Contents</a>
      </div>
    </div>

    <div class="form">
        <ul>

            <li>
                <span class="label">Created</span>
                <span class="created">{{shipment.CREATED}}</span>
                <span><i class="fa fa-unlock"></i> Edit</span>
            </li>

            <li>
                <span class="label">Status</span>
                <span class="stat">{{shipment.SHIPPINGSTATUS}}</span>
            </li>

            <li>
                <span class="label">Outgoing Lab Contact</span>
                <span  v-if="!isEditable('SENDINGLABCONTACTID')" class="SENDINGLABCONTACTID">{{shipment.LCOUT}}</span>
                <sw-select-input v-else v-model="shipment.SENDINGLABCONTACTID" :options="labContacts" optionValueKey="LABCONTACTID" optionTextKey="CARDNAME"/>
                <span @click="toggleEditable('SENDINGLABCONTACTID')"><i class="fa fa-lock"></i> Edit</span>
            </li>

            <li>
                <span class="label">Return Lab Contact</span>
                <span class="RETURNLABCONTACTID">{{shipment.LCRET}}</span>
            </li>
            <li>
                <span class="label">Safety Level</span>
                <span class="SAFETYLEVEL">{{shipment.SAFETYLEVEL}}</span>
            </li>
            <li>
                <span class="label">Courier</span>
                <span v-if="!isEditable('DELIVERYAGENT_AGENTNAME')" class="DELIVERYAGENT_AGENTNAME">{{shipment.DELIVERYAGENT_AGENTNAME}}</span>
                <sw-text-input v-else v-model="shipment.DELIVERYAGENT_AGENTNAME"/>
                <span @click="toggleEditable('DELIVERYAGENT_AGENTNAME')"><i :class="['fa', isEditable('DELIVERYAGENT_AGENTNAME') ? 'fa-unlock' : 'fa-lock']"></i> Edit</span>
            </li>

            <li>
                <span class="label">Courier Account No.</span>
                <span class="DELIVERYAGENT_AGENTCODE">{{shipment.DELIVERYAGENT_AGENTCODE}}</span>
            </li>

            <li>
                <span class="label">Shipping Date</span>
                <span class="DELIVERYAGENT_SHIPPINGDATE">{{shipment.DELIVERYAGENT_SHIPPINGDATE}}</span>
            </li>

            <li>
                <span class="label">Shipping Airway Bill</span>
                <span class="DELIVERYAGENT_FLIGHTCODE">{{shipment.DELIVERYAGENT_FLIGHTCODE}}</span>
            </li>

            <li>
                <span class="label">Shipping Pickup Location</span>
                <span class="PHYSICALLOCATION">{{shipment.PHYSICALLOCATION}}</span>
            </li>

            <li>
                <span class="label">Shipping Ready By</span>
                <span class="READYBYTIME">{{shipment.READYBYTIME}}</span>
            </li>

            <li>
                <span class="label">Shipping Close Time</span>
                <span class="CLOSETIME">{{shipment.CLOSETIME}}</span>
            </li>

            <div v-if="shipment.DELIVERYAGENT_PICKUPCONFIRMATION">
              <li>
                  <span class="label">Shipping Pickup Confirmed</span>
                  Yes - Confirmation Number: <span class="DELIVERYAGENT_PICKUPCONFIRMATION">{{shipment.DELIVERYAGENT_PICKUPCONFIRMATION}}</span>
                  <a href="#" class="button cancel_pickup"><i class="fa fa-times"></i> Cancel</a>
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
                <span class="DELIVERYAGENT_DELIVERYDATE">{{shipment.DELIVERYAGENT_DELIVERYDATE}}</span>
            </li>

            <li>
                <span class="label">Comments</span>
                <div class="COMMENTS text tw-inline-block tw-w-3/5">{{shipment.COMMENTS}}</div>
            </li>
        </ul>
        <div class="clear"></div>
    </div>


    <h1>Shipment Contents</h1>

    <p class="help">Select a dewar by clicking on the row in the table below. Package details are then shown below. Click the + icon to add a container to the selected package</p>

    <div class="ra"><a v-if="PROPOSAL_ACTIVE" href="#" class="button" id="add_dewar" title="Add a dewar to this shipment"><i class="fa fa-plus"></i> Add Dewar</a></div>

    <!-- <div class="table"></div> -->
    <table-component
      :headers="dewarTableHeaders"
      :data="dewars"
      @row-clicked="onShowDewar"
    ></table-component>


    <h1>
        Package Details: {{currentDewarName}}
        <!-- Old style large add container button -->
        <!-- <span v-if="PROPOSAL_ACTIVE" class="r padded_button add_container">
          <a class="button" :href="'/containers/add/did/'+currentDewarId"><i class="fa fa-plus"></i> Add Container</a>
        </span> -->
    </h1>

    <p class="help">This section shows contents and history for the selected package. Click the spyglass icon to view the contents of the container</p>

    <!-- Tailwind options here -->
    <!-- If we want to move the Add Container button to be consistent with Add Dewar -->
    <div class="tw-flex tw-justify-end tw-my-2">
        <span class="r padded_button add_container">
          <span v-if="PROPOSAL_ACTIVE" class="r padded_button add_container">
            <a class="button" :href="'/containers/add/did/'+currentDewarId"><i class="fa fa-plus"></i> Add Container</a>
          </span>
        </span>
    </div>

    <div class="tw-flex tw-flex-col sm:tw-flex-row">
        <div class="tw-w-full sm:tw-w-1/2 sm:tw-mr-2 dcontent">
          <ul class="containers">
            <li v-for="container in containers" :key="container.CONTAINERID">
              {{container.CONTAINERID}} ({{container.SAMPLES}} Samples)

              <span class="r">
                <a class="button button-notext print" title="Click to print container contents" :href="'/api/pdf/container/cid/'+container.CONTAINERID+'/prop/'+PROPOSAL"><i class="fa fa-print"></i> <span>Print Container Report</span></a>
                <a class="button button-notext view" title="Click to View Container" :href="'/containers/cid/'+container.CONTAINERID"><i class="fa fa-search"></i> <span>View Container</span></a>
                <a href="#" class="button button-notext move"><i class="fa fa-arrows"></i> <span>Move Container</span></a>
              </span>

            </li>

            <li v-if="containers.length < 1">No containers found</li>
          </ul>
          <pagination-component @page-changed="onUpdateHistory" />
        </div>

        <div class="tw-w-full sm:tw-w-1/2 sm:tw-ml-2">
            <div class="sm:tw-flex sm:tw-flex-col">
                <div class="history table table-no-margin">
                  <table-component
                  :headers="dewarHistoryHeaders"
                  :data="dewarHistory"
                  noDataText="No history available"/>
                  <pagination-component @page-changed="onUpdateHistory" />
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
  </div>
</template>

<script>

import LabContactsCollection from 'collections/labcontacts'
import Containers from 'collections/containers'

import Dewars from 'collections/dewars'
import DewarHistory from 'modules/shipment/collections/dewarhistory'
import DewarTracking from 'modules/shipment/collections/dhl-tracking'

import SwTextInput from 'app/components/forms/sw_text_input.vue'
import SwSelectInput from 'app/components/forms/sw_select_input.vue'

import TableComponent from 'app/components/utils/table.vue'
import PaginationComponent from 'app/components/utils/pagination.vue'

export default {
  name: 'SCMShipmentView',
  components: {
    'sw-text-input': SwTextInput,
    'sw-select-input': SwSelectInput,
    'table-component': TableComponent,
    'pagination-component': PaginationComponent,
  },
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      editable: [],
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
        {key: 'CCOUNT', title: 'Containers'},
      ],
      dewars: [],
      currentDewarId: null,
      currentDewarName: null,

      dewarHistory: [],
      dewarHistoryHeaders: [
        {key: 'DATE', title: 'Date'},
        {key: 'DEWARSTATUS', title: 'Status'},
        {key: 'STORAGELOCATION', title: 'Location'},
      ],

      dewarTracking: [],
      dewarTrackingHeaders: [
        {key: 'DATE', title: 'Date'},
        {key: 'DEWARSTATUS', title: 'Status'},
        {key: 'STORAGELOCATION', title: 'Location'},
        {key: 'SIGNATORY', title: 'Signatory'},
      ],
      containers: [],
    }
  },

  computed: {
    PROPOSAL: function() {
      return this.$store.state.proposal.proposal
    },
    PROPOSAL_ACTIVE: function() {
      if (app.proposal && app.proposal.get('ACTIVE') == '1') return true
      else return false
    },
    DHL_ENABLE: function() {
      return app.options.get('dhl_enable')
    },
    DHL_LINK: function() {
      return app.options.get('dhl_link')
    },
    shipment: function() {
      return Object.assign({}, this.model.toJSON())
    },
    markAsSent: function() {
      return this.shipment.SHIPPINGSTATUS == 'opened' || this.shipment.SHIPPINGSTATUS == 'awb created' || this.shipment.SHIPPINGSTATUS == 'pickup booked'
    }
  },

  created: function() {
    // Get Lab Contacts
    this.getLocalContacts()

    // Backbone models for dewar / parcel contents

    this.dewarsCollection = new Dewars(null, { id: this.model.get('SHIPPINGID') })

    this.getDewars()
  },
  watch: {
    currentDewarId: function(newVal) {
      console.log("New Dewar Selected: " + newVal)
      // Note inconsistent use of id and dewarID!!!
      let dewarHistory = new DewarHistory()
      dewarHistory.id = this.currentDewarId

      let dewarContent = new Containers()
      dewarContent.dewarID = this.currentDewarId
      dewarContent.setSorting('NAME')


      // TODO sort tracking as well


      // Fetch the history and content for these dewars
      this.$store.dispatch('getCollection', dewarHistory).then( (result) => {
        console.log("DEWAR HISTORY: " + JSON.stringify(result))
        this.dewarHistory = result.toJSON()
      })
      this.$store.dispatch('getCollection', dewarContent).then( (result) => {
        console.log("DEWAR CONTENT: " + JSON.stringify(result))
        this.containers = result.toJSON()
      })
    }
  },

  methods: {
    onMarkAsSent: function() {
      console.log("Mark As Sent")
    },
    onShowDewar: function(dewar) {
      // Had some issues with scope of the passed object.
      // So set the currently selected dewar here and then watch the value for changes
      let dewarId = +dewar['DEWARID']
      // If we have selected the same dewar ignore
      this.currentDewarId = dewarId
      this.currentDewarName = dewar['CODE']
    },
    onUpdateHistory: function(payload) {
      console.log("Pagination changed for table")
    },
    toggleEditable: function(name) {
      console.log("Toggle Edit for " + name)
      let index = this.editable.indexOf(name)
      if ( index > -1 ) {
        console.log("Remove edit")
        this.editable.splice(index, 1)
      } else {
        console.log("Add edit")
        this.editable.push(name)
      }
      console.log("Editable State: " + JSON.stringify(this.editable))
    },
    isEditable: function(name) {
      return this.editable.indexOf(name) > -1 ? true : false
    },
    getLocalContacts: function() {
      let labContactsCollection = new LabContactsCollection(null, { state: { pageSize: 9999 } })

      this.$store.dispatch('getCollection', labContactsCollection).then( (result) => {
        this.labContacts = result.toJSON()
      })
    },
    // Get the dewars/packages from this shipment
    getDewars: function() {
      this.$store.dispatch('getCollection', this.dewarsCollection).then( (result) => {
        this.dewars = result.toJSON()
        console.log("Found dewars for this shipment: " + JSON.stringify(this.dewars))
        // If this is first time, select the first dewar in the list.
        if (this.currentDewarId == null) {
          this.currentDewarId = this.dewars[0].DEWARID
          this.currentDewarName = this.dewars[0].CODE
        }

      })
    },
  },
}
</script>