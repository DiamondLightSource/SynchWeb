<template>
  <div class="tw-p-3 content tw-w-full">
    <h2>Move {{ sample['NAME'] }}</h2>

    <validation-observer ref="moveContainerForm" v-slot="{ invalid }" tag="div" class="tw-mt-4">
      <validation-provider v-slot="{ errors }" vid="shipment" name="shipment" rules="required" tag="div" class="tw-flex tw-items-center tw-mb-4">
        <label class="tw-mr-3 tw-w-32">Shipment</label>
        <combo-box
          :data="shipments"
          class="tw-w-full shipment-select"
          textField="SHIPPINGNAME"
          valueField="SHIPPINGID"
          :inputIndex="0"
          defaultText="Select a Shipment"
          size="small"
          v-model="SHIPPINGID"
          :exclude-element-class-list="['custom-add']"
        />
      </validation-provider>

      <validation-provider v-slot="{ errors }" vid="dewars" name="dewars" rules="required" tag="div" class="tw-flex tw-items-center tw-mb-4">
        <label class="tw-mr-3 tw-w-32">Dewar</label>
        <combo-box
          :data="dewars"
          class="tw-w-full dewar-select"
          textField="CODE"
          valueField="DEWARID"
          :inputIndex="1"
          defaultText="Select a Dewar"
          size="small"
          v-model="DEWARID"
          :isDisabled="!SHIPPINGID || dewars.length < 1"
          :exclude-element-class-list="['custom-add']"
        />
      </validation-provider>

      <validation-provider v-slot="{ errors }" vid="containers" name="containers" rules="required" tag="div" class="tw-flex tw-items-center tw-mb-4">
        <label class="tw-mr-3 tw-w-32">Container</label>
        <combo-box
          :data="containers"
          class="tw-w-full container-select"
          textField="NAME"
          valueField="CONTAINERID"
          :inputIndex="2"
          defaultText="Select a Container"
          size="small"
          v-model="CONTAINERID"
          :isDisabled="!DEWARID || containers.length < 1"
          :exclude-element-class-list="['custom-add']"
        />
      </validation-provider>

      <validation-provider v-slot="{ errors }" vid="containers" name="containers" rules="required" tag="div" class="tw-flex tw-items-center tw-mb-3">
        <label class="tw-mr-3 tw-w-32">Locations</label>
        <div class="tw-w-full">
          <combo-box
            :data="availableLocation"
            class="tw-w-full location-select"
            textField="TEXT"
            valueField="VALUE"
            :inputIndex="3"
            defaultText="Select a Location"
            size="small"
            v-model="LOCATION"
            :isDisabled="!CONTAINERID || availableLocation.length < 1"
            :exclude-element-class-list="['custom-add']"
          />
        </div>
      </validation-provider>

      <div class="tw-mb-5">
        <p class="tw-text-content-inactive" v-if="containerMessage">{{ containerMessage }}</p>
        <p class="tw-text-content-inactive" v-if="loaded && availableLocation.length < 1">Selected container is full</p>
      </div>

      <button class="button tw-mb-3" :disabled="invalid" @click="moveSampleToContainer">Move Sample</button>
    </validation-observer>
  </div>
</template>
<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import { differenceBy } from 'lodash-es'

import BaseInputSelect from 'app/components/base-input-select.vue'

import Shipments from 'collections/shipments'
import Dewars from 'collections/dewars'
import Containers from 'collections/containers'
import ComboBox from 'app/components/combo-box.vue'

export default {
  name: 'move-sample-to-container',
  components: {
    'combo-box': ComboBox,
    'base-input-select': BaseInputSelect,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver
  },
  props: {
    sample: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      SHIPPINGID: '',
      DEWARID: '',
      CONTAINERID: '',
      LOCATION: '',
      shipments: [],
      dewars: [],
      containers: [],
      availableLocation: [],
      dewarDescription: 'Select a Dewar',
      containerDescription: 'Select a Container',
      loaded: false,
      containerMessage: '',
    }
  },
  created() {
    this.fetchShipments()
  },
  methods: {
    async fetchShipments() {
      const shipmentsCollection = new Shipments(null, { state: { pageSize: 9999 } })
      const results = await this.$store.dispatch('getCollection', shipmentsCollection)

      this.shipments = results.toJSON()
    },
    async fetchDewars() {
      const dewarsCollection = new Dewars(null, { id: this.SHIPPINGID, state: { pageSize: 9999 } })
      const results = await this.$store.dispatch('getCollection', dewarsCollection)

      this.dewars = results.toJSON()
    },
    async fetchContainers() {
      const containersCollection = new Containers(null, { state: { pageSize: 9999 } })
      containersCollection.dewarID = this.DEWARID
      const results = await this.$store.dispatch('getCollection', containersCollection)

      this.containers = results.toJSON()
    },
    async fetchContainerSamples() {
      this.loaded = false
      this.containerMessage = ''
      const selectedContainer = this.containers.find(container => Number(container['CONTAINERID']) === Number(this.CONTAINERID))

      if (selectedContainer['CONTAINERSTATUS'] !== 'processing') {
        const result = await this.$store.dispatch('fetchDataFromApi', {
          url: `/sample/cid/${this.CONTAINERID}?page=1&per_page=9999`,
          requestType: 'fetching samples from container'
        })

        const filledLocations = result.data.map(item => ({ TEXT: Number(item.LOCATION), VALUE: Number(item.LOCATION) }))
        const locationField = Array(Number(selectedContainer['CAPACITY'])).fill('').map((item, index) => ({ TEXT: index + 1, VALUE: index + 1 }))

        this.availableLocation = differenceBy(locationField, filledLocations, 'TEXT')
      } else {
        this.containerMessage = 'This container is currently assigned and in use on a beamline sample changer. Unassign it to make it selectable'
      }
      this.loaded = true
    },
    async moveSampleToContainer() {
      const validated = await this.$refs.moveContainerForm.validate()

      if (validated) {
        this.$emit('save-sample-move', {
          CONTAINERID: Number(this.CONTAINERID),
          BLSAMPLEID: Number(this.sample['BLSAMPLEID']),
          LOCATION: Number(this.LOCATION)
        })

        this.$emit('close-modal')
      }
    }
  },
  watch: {
    SHIPPINGID(newValue) {
      if (newValue) {
        this.fetchDewars()
      }
    },
    DEWARID(newValue) {
      if (newValue) {
        this.fetchContainers()
      }
    },
    CONTAINERID(newValue) {
      if (newValue) {
        this.fetchContainerSamples()
      }
    }
  }
}
</script>
<style scoped>
>>> .shipment-select .items-list,
>>> .dewar-select .items-list,
>>> .container-select .items-list,
>>> .location-select .items-list {
  height: 150px;
  overflow-y: auto;
}
</style>