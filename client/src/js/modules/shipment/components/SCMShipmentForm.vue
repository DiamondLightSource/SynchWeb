<template>
  <div class="content">
    <h1>Add Shipment</h1>

    <!-- Wrap the form in an observer component so we can check validation state on submission -->
    <validation-observer ref="observer" v-slot="{ invalid }">

    <form method="post" id="add_shipment" @submit.prevent="onSubmit">

    <div class="form">

        <div class="tw-flex-col">

          <h1 class="tw-text-lg tw-font-bold tw-mb-2">Shipment Details</h1>

          <validation-provider tag="div" class="tw-mb-4" name="SHIPPINGNAME" vid="shipment-name" :rules="validationRules('SHIPPINGNAME')" v-slot="{ errors }">
            <sw-text-input
              id="shipment-name"
              label="Name"
              inputClass="tw-border tw-border-green-500"
              description="Name for the shipment"
              v-model="shipmentName"
              :errorMessage="errors[0]"
            />
          </validation-provider>

          <validation-provider tag="div" class="tw-mb-4" rules="numeric">
            <sw-text-input
              label="How many pre-registered dewar/parcels to add now?"
              type="number"
              description="You can add items later if required"
              name="NUMPIECES"
              v-model="numPieces"
              rules="numeric"
              />
          </validation-provider>

          <div class="tw-mb-4">
            <label>Number of Dewars/Parcels</label>
            <div class="tw-flex">
              <sw-select-input v-for="(dewar, index) in dewarList" :key="index"
                v-model="dewar.value"
                :options="dewars"
                optionValueKey="FACILITYCODE"
                optionTextKey="FACILITYCODE"
              />
            </div>
            <div v-show="numPieces == 0" class="tw-flex"><span>No parcels defined yet</span></div>
          </div>

          <div class="tw-mb-4">
              <!-- Small tweaks to the styling here using tailwind flexbox -->
              <label>First Experiment / Scheduling
                  <span class="small">Select first experiment or if it's for an automated or responsive remote mail-in session</span>
              </label>
              <div class="tw-flex">
                  <sw-radio-input class="tw-mt-2" :options="sessionTypes" v-model="sessionType" />
                  <sw-select-input v-show="sessionType == 0" name="FIRSTEXPERIMENTID" class="tw-mr-2" v-model="selectedVisit" :options="visits" optionValueKey="SESSIONID" optionTextKey="VISITDETAIL" defaultText="Please select a visit"></sw-select-input>
              </div>
          </div>


          <validation-provider rules="required" name="safety level" v-slot="{ errors }">
            <sw-select-input
              name="Safety Level"
              label="Safety Level"
              description="The safety level of the shipment"
              defaultText="Please select a risk rating"
              v-model="safetyLevel"
              :options="[{'NAME':'Green', 'ID': 'Green'}, {'NAME':'Yellow', 'ID': 'Yellow'}, {'NAME':'Red', 'ID': 'Red'}]"
              optionValueKey="ID"
              optionTextKey="NAME"
              :errorMessage="errors[0]"/>
          </validation-provider>

            <sw-textarea-input id="comments" v-model="comments" name="COMMENTS" description="Comment for the shipment" label="Comments"/>

          <h1 class="tw-text-lg tw-font-bold tw-mb-2">Delivery information</h1>
          <validation-provider rules="required" name="Sending Lab Contact" v-slot="{ errors }">
            <sw-select-input id="labcontacts-sending-id" name="SENDINGLABCONTACTID" v-model="sendingLabContact" :options="labContacts" optionValueKey="LABCONTACTID" optionTextKey="CARDNAME" label="Outgoing Lab Contact" defaultText="Please select a labcontact" :errorMessage="errors[0]">
              <template v-slot:description><span class="small">Lab contact for outgoing transport | <a class="add_lc" @click.prevent="onAddLocalContact" href="/contact/add">Add</a></span></template>
            </sw-select-input>
          </validation-provider>

          <validation-provider rules="required" name="Return Lab Contact" v-slot="{ errors }">
            <sw-select-input id="labcontacts-return-id" name="RETURNLABCONTACTID" v-model="returnLabContact" :options="labContacts" optionValueKey="LABCONTACTID" optionTextKey="CARDNAME" label="Return Lab Contact" defaultText="Please select a labcontact" :errorMessage="errors[0]">
              <template v-slot:description><span class="small">Lab contact for return transport | <a class="add_lc" @click.prevent="onAddLocalContact" href="/contact/add">Add</a></span></template>
            </sw-select-input>
          </validation-provider>

          <validation-provider :rules="validationRules('DELIVERYAGENT_SHIPPINGDATE')" name="Shipment Date" v-slot="{ errors }">
            <sw-date-input id="shipment-date" v-model="shipmentDate" name="DELIVERYAGENT_SHIPPINGDATE" description="Date shipment will leave lab / be picked up" label="Shipping Date" :errorMessage="errors[0]"/>
          </validation-provider>

            <validation-provider :rules="validationRules('PHYSICALLOCATION')" name="Pickup Location" v-slot="{ errors }">
              <sw-text-input id="pickup-location" v-model="pickupLocation" name="PHYSICALLOCATION" description="Location where shipment can be picked up from. i.e. Reception" label="Pickup Location" :errorMessage="errors[0]"/>
            </validation-provider>

            <sw-time-input id="ready-time" v-model="readyTime" name="READYBYTIME" description="Time shipment will be ready for pickup" label="Ready by Time"/>

            <sw-time-input id="close-time" v-model="closeTime" name="CLOSETIME" description="Time after which shipment cannot be picked up" label="Close Time"/>

            <sw-date-input id="delivery-date" v-model="deliveryDate" name="DELIVERYAGENT_DELIVERYDATE" description="Estimated date of delivery at facility" label="Delivery Date"/>

            <sw-text-input id="courier-name" v-model.trim="courierName" name="DELIVERYAGENT_AGENTNAME" description="Courier name for the return shipment" label="Courier Name">
              <template v-slot:actions><span v-if="DHL_ENABLE"><a :href="DHL_LINK" class="dhl button"><i class="fa fa-envelope"></i> Use Facility Account (UK ONLY)</a></span></template>
            </sw-text-input>

            <sw-text-input id="courier-account" v-model="courierAccount" name="DELIVERYAGENT_AGENTCODE" description="Courier account number for the return shipment" label="Courier Account Number"/>

            <button name="submit" type="submit" class="button submit" :class="{ 'tw-border tw-border-red-500' : invalid}">Add Shipment</button>

        </div>
    </div>

    </form>
    </validation-observer>
  </div>
</template>

<script>
import ShipmentModel from 'models/shipment'
import VisitsCollection from 'collections/visits'
import LabContactsCollection from 'collections/labcontacts'
import DewarRegistryCollection from 'modules/shipment/collections/dewarregistry'

import AddContactView from 'modules/contact/views/addcontact'
import DialogView from 'views/dialog'

import SwTextInput from 'app/components/forms/sw_text_input.vue'
import SwSelectInput from 'app/components/forms/sw_select_input.vue'
import SwTextAreaInput from 'app/components/forms/sw_textarea_input.vue'
import SwDateInput from 'app/components/forms/sw_date_input.vue'
import SwTimeInput from 'app/components/forms/sw_time_input.vue'
import SwCheckboxInput from 'app/components/forms/sw_checkbox_input.vue'
import SwRadioInput from 'app/components/forms/sw_radio_input.vue'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

const SCHEDULED_SESSION = 0
const AUTOMATED_SESSION = 1
const RESPONSIVE_SESSION = 2


export default {
  components: {
    'sw-text-input': SwTextInput,
    'sw-select-input': SwSelectInput,
    'sw-textarea-input': SwTextAreaInput,
    'sw-date-input': SwDateInput,
    'sw-checkbox-input': SwCheckboxInput,
    'sw-radio-input': SwRadioInput,
    'sw-time-input': SwTimeInput,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider
  },
  name: 'SCMShipment',
  data: function() {
    return {
      // Number of packages included in this shipment
      numPieces: 0,
      // Arrays of options that will be presented to the user
      dewars: [],
      labContacts: [],
      visits: [],
      sessionTypes: [
        {id: 0, label: 'Scheduled Session: ', value: SCHEDULED_SESSION},
        {id: 1, label: 'Automated / Imager', value: AUTOMATED_SESSION},
        {id: 2, label: 'Responsive Remote / Mail-in', value: RESPONSIVE_SESSION}
      ],
      sessionType: SCHEDULED_SESSION,
      selectedVisit: '',

      // Values that will be added to the shipment request
      shipmentName: '',

      shipmentDate: '',
      readyTime: '',
      closeTime: '',
      courierName: '',
      courierAccount: '',
      deliveryDate: '',
      pickupLocation: '',

      sendingLabContact: '',
      returnLabContact: '',

      comments: '',
      safetyLevel: '',
    }
  },

  computed: {
    DHL_ENABLE: function() {
      return app.options.get('dhl_enable')
    },
    DHL_LINK: function() {
      return app.options.get('dhl_link')
    },
    // Should handle the case where we have some dewars already selected
    // Only remove or popoff the difference rather than start again
    dewarList: function() {
      return Array.from({length: this.numPieces}, () => { return {value: ''} })
    },
  },

  watch: {
    sessionType: function(newVal) {
      if (newVal == SCHEDULED_SESSION) this.comments = "Scheduled session selected"
      else if (newVal == RESPONSIVE_SESSION) this.comments = "Responsive session selected"
      else if (newVal == AUTOMATED_SESSION) this.comments = "Automated session selected"
      else this.comments = ""
    },
    dewarList: function(newVal) {
      console.log("Dewar list updated: " + JSON.stringify(newVal))
    }
  },

  created: function() {

    let visitsCollection = new VisitsCollection(null, { queryParams: { next: 1 }, state: { pageSize: 9999 } })
    let dewarRegistryCollection = new DewarRegistryCollection(null, { state: { pageSize: 9999 } })

    this.getLocalContacts()

    this.$store.dispatch('getCollection', visitsCollection).then( (result) => {
      this.visits = result.toJSON()
    })

    this.$store.dispatch('getCollection', dewarRegistryCollection).then( (result) => {
      this.dewars = result.toJSON()
    })
  },

  methods: {
    validationRules: function(property) {
      return ShipmentModel.validationRules()[property] || ''
    },
    onSubmit: function() {
      this.$refs.observer.validate().then( (result) => {
        if (result) this.saveShipment()
        else console.log("Form validation failed ")
      })
    },
    saveShipment: function() {
      // The backbone model we are going to save
      // Its actually very simple - just specify the attributes in an object
      let shipmentModel = new ShipmentModel({
        SHIPPINGNAME: this.shipmentName,
        SAFETYLEVEL: this.safetyLevel,
        FCODES: this.dewarList.map( (item) => item.value ),
        DEWARS: this.dewarList.length,
        DELIVERYAGENT_AGENTNAME: this.courierName,
        DELIVERYAGENT_AGENTCODE: this.courierAccount,
        DELIVERYAGENT_DELIVERYDATE: this.deliveryDate,
        DELIVERYAGENT_SHIPPINGDATE: this.shipmentDate,
        CLOSETIME: this.closeTime,
        READYBYTIME: this.readyTime,
        FIRSTEXPERIMENTID: this.selectedVisit,
        COMMENTS: this.comments,
        PHYSICALLOCATION: this.pickupLocation,
        SENDINGLABCONTACTID: this.sendingLabContact,
        RETURNLABCONTACTID: this.returnLabContact
      })
      console.log(JSON.stringify(shipmentModel))

      this.saveModel(shipmentModel)
    },

    // Save the model
    // On success - redirect to view the newly created shipment
    // On error - add a notification and stay where we are
    saveModel: function(model) {
      let self = this
      this.$store.commit('loading', true)

      model.save({}, {
        success: function(model, response) {
          self.$store.commit('loading', false)
          let sid = model.get('SHIPPINGID')
          console.log("Shipment Model was saved " + JSON.stringify(response))
          console.log("Shipment ID = " + sid)
          self.$router.push({name: 'shipment-view', params: { sid } })
        },
        error: function(model, response, options) {
            console.log('failure from shipadd')
            self.$store.commit('loading', false)
            self.$store.commit('notifications/addNotification', { message: 'Something went wrong registering this shipment, please try again', level: 'error'})
        },
      })
    },
    onAddLocalContact: function() {
      app.dialog.show(new DialogView({ title: 'Add Home Lab Contact', className: 'content', view: new AddContactView({ dialog: true }), autoSize: true }))
      app.listenTo(app.dialog.currentView, 'close', this.getLocalContacts, this)
    },
    getLocalContacts: function() {
      let labContactsCollection = new LabContactsCollection(null, { state: { pageSize: 9999 } })

      this.$store.dispatch('getCollection', labContactsCollection).then( (result) => {
        this.labContacts = result.toJSON()
      })
    },
  },
}
</script>