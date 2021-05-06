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
        <base-input-select
          label="Substance"
          v-model="inputValue.PROTEINID"
          optionValueKey="PROTEINID"
          optionTextKey="ACRONYM"
          defaultText=" - "
          :options="proteins"
          />
        <base-input-select
          label="Sample Type"
          v-model="inputValue.TYPE"
          optionValueKey="ID"
          optionTextKey="TYPE"
          :options="sampleTypes"
        />
        <base-input-text
          label="Sample Name"
          v-model="inputValue.NAME"
          name="SAMPLE_NAME" />

        <base-input-text
          label="Volume"
          v-model="inputValue.VOLUME"
          name="VOLUME" />

      <!-- Issues getting this to update -->
        <base-input-select
          :key="pkey"
          v-model="inputValue.COLUMN"
          :options="purificationColumns"
          optionValueKey="PURIFICATIONCOLUMNID"
          optionTextKey="NAME"
          label="Column"
          name="COLUMN"
          defaultText="Optionally set a column" />

        <base-input-text
          label="Buffer"
          v-model="inputValue.BUFFER"
          name="BUFFER" />

        <base-input-text v-if="experimentKind == 'robot'"
          label="Robot Plate Temperature"
          v-model="inputValue.ROBOTPLATETEMPERATURE"
          name="ROBOTPLATETEMPERATURE" />

        <base-input-text v-if="experimentKind == 'robot'"
          label="Exposure Temperature"
          v-model="inputValue.EXPOSURETEMPERATURE"
          name="EXPOSURETEMPERATURE" />

    </div>

  </div>
</template>

<script>

import PurificationColumns from 'modules/shipment/collections/purificationcolumns'

import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

export default {
  name: 'single-sample-new',
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
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

    this.$store.dispatch('getCollection', this.purificationColumnsCollection).then( (result) => {
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