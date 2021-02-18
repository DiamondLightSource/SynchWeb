<template>
  <div class="content">
    <h1>Sample</h1>
      <div class="ra">
        <a href="#" class="button clone-plate"><i class="fa fa-plus"></i> Plate</a>
        <a href="#" class="button clone-col"><i class="fa fa-plus"></i> Column</a>
        <a href="#" class="button clone-row"><i class="fa fa-plus"></i> Row</a>

        <a href="#" class="button clear-plate" title="Clear Plate"><i class="fa fa-times"></i> Plate</a>
        <a href="#" class="button clear-col" title="Clear Column"><i class="fa fa-times"></i> Column</a>
        <a href="#" class="button clear-row" title="Clear Row"><i class="fa fa-times"></i> Row</a>

        <a href="#" class="button clear" title="Clear Sample"><i class="fa fa-times"></i></a>
    </div>

    <div class="tw-flex tw-flex-row-reverse">
        <a class="button extrainfo r" href="#" title="Show extra fields"><i class="fa fa-plus"></i> Extra Fields</a>
    </div>
    <div class="form">
        <sw-select-input
          label="Substance"
          v-model="inputValue.PROTEINID"
          optionValueKey="PROTEINID"
          optionTextKey="ACRONYM"
          defaultText=" - "
          :options="proteins"
          />
        <sw-select-input
          label="Sample Type"
          v-model="inputValue.TYPE"
          optionValueKey="ID"
          optionTextKey="TYPE"
          :options="sampleTypes"
        />
        <sw-text-input
          label="Sample Name"
          v-model="inputValue.NAME"
          name="SAMPLE_NAME" />

        <sw-text-input
          label="Volume"
          v-model="inputValue.VOLUME"
          name="VOLUME" />

      <!-- Issues getting this to update -->
        <sw-select-input
          :key="pkey"
          v-model="inputValue.COLUMN"
          :options="purificationColumns"
          optionValueKey="PURIFICATIONCOLUMNID"
          optionTextKey="NAME"
          label="Column"
          name="COLUMN"
          defaultText="Optionally set a column" />

        <sw-text-input
          label="Buffer"
          v-model="inputValue.BUFFER"
          name="BUFFER" />

        <sw-text-input v-if="experimentKind == 'robot'"
          label="Robot Plate Temperature"
          v-model="inputValue.ROBOTPLATETEMPERATURE"
          name="ROBOTPLATETEMPERATURE" />

        <sw-text-input v-if="experimentKind == 'robot'"
          label="Exposure Temperature"
          v-model="inputValue.EXPOSURETEMPERATURE"
          name="EXPOSURETEMPERATURE" />

    </div>

  </div>
</template>

<script>

import PurificationColumns from 'modules/shipment/collections/purificationcolumns'

import SwTextInput from 'app/components/forms/sw_text_input.vue'
import SwSelectInput from 'app/components/forms/sw_select_input.vue'
import SwTextAreaInput from 'app/components/forms/sw_textarea_input.vue'
import SwCheckboxInput from 'app/components/forms/sw_checkbox_input.vue'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

export default {
  name: 'single-sample-new',
  components: {
    'sw-select-input': SwSelectInput,
    'sw-text-input': SwTextInput,
    'sw-textarea-input': SwTextAreaInput,
    'sw-checkbox-input': SwCheckboxInput,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider,
  },
  props: {
    proteins: {
      type: Array,
    },
    // Passed v-model
    value: {
      type: Object,
      required: true
    },
    experimentKind: {
      type: String,
    }
  },
  data: function() {
    return {
      purificationColumns: [],
      purificationColumn: '',
      pkey: 0,
    }
  },
  created: function() {
    this.purificationColumnsCollection = new PurificationColumns()
    this.purificationColumns = []

    this.$store.dispatch('get_collection', this.purificationColumnsCollection).then( (result) => {
      console.log("Purification columns collection: " + this.purificationColumnsCollection.toJSON())
      console.log("Purification columns JSON: " + this.purificationColumns)
      this.purificationColumns = result.toJSON()
      this.pkey += 1
    })
  },
  computed: {
    inputValue: {
      get() {
        return this.value
      },
      set(val) {
        console.log("Set value checked on inputValue")
        this.$emit('input', val)
      }
    }
  },

  data: function() {
    return {
      sampleTypes: [
        {ID: 0, TYPE: 'Sample'},
        {ID: 1, TYPE: 'Buffer'},
      ]
    }
  }


}
</script>