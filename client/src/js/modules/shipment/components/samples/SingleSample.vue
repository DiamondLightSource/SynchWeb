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
          v-model="inputValue.acronym"
          optionValueKey="PROTEINID"
          optionTextKey="ACRONYM"
          defaultText=" - "
          :options="proteins"
          />
        <sw-select-input
          label="Sample Type"
          v-model="inputValue.sampleType"
          optionValueKey="ID"
          optionTextKey="TYPE"
          :options="sampleTypes"
        />
        <sw-text-input
          label="Sample Name"
          v-model="inputValue.name"
          name="SAMPLE_NAME" />

        <sw-text-input
          label="Volume"
          v-model="inputValue.volume"
          name="VOLUME" />

        <sw-text-input
          v-model="inputValue.column"
          label="Column"
          name="COLUMN" />

        <sw-text-input
          label="Buffer"
          v-model="inputValue.buffer"
          name="BUFFER" />

        <sw-text-input v-if="experimentKind == 'robot'"
          label="Robot Plate Temperature"
          v-model="inputValue.plateTemperature"
          name="PLATE_TEMPERATURE" />

        <sw-text-input v-if="experimentKind == 'robot'"
          label="Exposure Temperature"
          v-model="inputValue.exposureTemperature"
          name="EXPOSURE_TEMPERATURE" />

    </div>

  </div>
</template>

<script>
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