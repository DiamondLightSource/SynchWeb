<template>
  <div class="tw-p-3 content">
    <h1>Move {{ sampleName }} Sample</h1>

    <div class="form">
      <validation-observer ref="addNewInspection" v-slot="{ invalid }" tag="form">
        <validation-provider v-slot="{ errors }" vid="shipment" name="shipment" rules="required" slim>
          <base-input-select
            outer-class="tw-mb-2 tw-py-2"
            v-model="SHIPMENTID"
            label="Shipment"
            name="SHIPMENT"
            :options="shipments"
            optionValueKey="SHIPPINGID"
            optionTextKey="SHIPPINGNAME"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            :error-message="errors[0]"
          />
        </validation-provider>

        <validation-provider v-slot="{ errors }" vid="dewars" name="dewars" rules="required" slim>
          <base-input-select
            outer-class="tw-mb-2 tw-py-2"
            v-model="DEWARID"
            label="Dewar"
            name="DEWAR"
            :options="dewars"
            optionValueKey="DEWARID"
            optionTextKey="BARCODE"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            :error-message="errors[0]"
            :disabled="!SHIPPINGID || dewars.length < 1"
          />
        </validation-provider>

        <validation-provider v-slot="{ errors }" vid="containers" name="containers" rules="required" slim>
          <base-input-select
            outer-class="tw-mb-2 tw-py-2"
            v-model="CONTAINERID"
            label="Container"
            name="CONTAINER"
            :options="containers"
            optionValueKey="CONTAINERID"
            optionTextKey="NAME"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            :error-message="errors[0]"
            :disabled="!DEWARID || containers.length < 1"
          />
        </validation-provider>

        <validation-provider v-slot="{ errors }" vid="containers" name="containers" rules="required" slim>
          <base-input-select
            outer-class="tw-mb-2 tw-py-2"
            v-model="LOCATION"
            label="Location"
            name="LOCATION"
            :options="availableLocation"
            optionValueKey="VALUE"
            optionTextKey="TEXT"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            :error-message="errors[0]"
            :disabled="!CONTAINERID || availableLocation.length < 1"
          />
        </validation-provider>

        <button class="button tw-mb-3" :disabled="invalid" @click="moveSampleToContainer">Move Container</button>
      </validation-observer>
    </div>
  </div>
</template>
<script>
import BaseInputSelect from 'app/components/base-input-select.vue'
import { ValidationProvider, ValidationObserver } from 'vee-validate'

export default {
  name: 'move-sample-to-container',
  components: {
    'base-input-select': BaseInputSelect,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver
  },
  props: {
    sampleName: {
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
      containerDescription: 'Select a Container'
    }
  },
  methods: {
    moveSampleToContainer() {}
  }
}
</script>