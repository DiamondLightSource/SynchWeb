<template>
  <div class="content">
    <h1>Sample Location {{sampleLocation}}</h1>
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
      <validation-provider slim :rules="inputValue.NAME ? 'required|min_value:1' : ''" v-slot="{ errors }">
        <base-input-select
        label="Protein"
        v-model="inputValue[sampleIndex].PROTEINID"
        optionValueKey="PROTEINID"
        optionTextKey="ACRONYM"
        defaultText=" - "
        :options="availableProteins"
        :quiet="true" 
        :errorMessage="errors[0]"/>
      </validation-provider>

      <validation-provider slim :rules="inputValue.PROTEINID > -1 ? 'required|alpha_dash|max:12' : ''" v-slot="{ errors }">
        <base-input-text
          label="Sample Name"
          v-model="inputValue[sampleIndex].NAME"
          name="SAMPLE_NAME" 
          :quiet="true" 
          :errorMessage="errors[0]"/>
      </validation-provider>

      <validation-provider slim rules="decimal|min_value:10|max_value:100" name="Volume" :vid="volume" v-slot="{ errors }">
        <base-input-text
        label="Volume"
        v-model="inputValue[sampleIndex].VOLUME"
        name="VOLUME" 
        :quiet="true" 
        :errorMessage="errors[0]"/>
      </validation-provider>

      <!-- Issues getting this to update -->
      <base-input-select
        :key="pkey"
        v-model="inputValue[sampleIndex].COLUMN"
        :options="purificationColumns"
        optionValueKey="PURIFICATIONCOLUMNID"
        optionTextKey="NAME"
        label="Column"
        name="COLUMN"
        defaultText="Optionally set a column" />

      <validation-provider slim v-if="showInputHplcExp" rules="alpha_dash|max:1000" name="Comments" :vid="'comments-'+sampleIndex" v-slot="{ errors }">
        <base-input-text
          label="Comments"
          v-model="inputValue[sampleIndex].COMMENTS"
          :quiet="true"
          :errorMessage="errors[0]"/>
      </validation-provider>

      <base-input-text v-if="experimentKind == 'robot'"
        label="Robot Plate Temperature"
        v-model="inputValue[sampleIndex].ROBOTPLATETEMPERATURE"
        name="ROBOTPLATETEMPERATURE" />

      <base-input-text v-if="experimentKind == 'robot'"
        label="Exposure Temperature"
        v-model="inputValue[sampleIndex].EXPOSURETEMPERATURE"
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

const EXPERIMENT_TYPE_ROBOT = 'Robot'
const EXPERIMENT_TYPE_HPLC = 'HPLC'

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
    },
    sampleLocation: {
      type: Number,
      default: 1
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
        this.$emit('input', val)
      }
    },
    sampleIndex: function() {
      // Sample location is the 1..192 location
      // Here we want to edit a zero-indexed array
      return this.sampleLocation - 1
    },
    availableProteins: function() {
      return this.proteins.toJSON()
    },
  },

  data: function() {
    return {
      sampleTypes: [
        {ID: 0, TYPE: 'Sample'},
        {ID: 1, TYPE: 'Buffer'},
      ]
    }
  },
  watch: {
    sampleLocation: function(newVal) {
      console.log("Single sample now editing different sample - " + newVal)
    }
  },
  methods: {
    showInputRobotExp: function() {
      if (this.experimentKind == EXPERIMENT_TYPE_ROBOT) return true
      else {
        // We could clear any temperature values here if needed/required
        this.inputValue.forEach( (v) => { v.ROBOTPLATETEMPERATURE = ''; v.EXPOSURETEMPERATURE = ''})
        return false
      }
    },
    showInputHplcExp: function() {
      if (this.experimentKind == EXPERIMENT_TYPE_HPLC) return true
      else {
        // We could clear any values here if needed/required
        this.inputValue.forEach( (v) => { v.PURIFICATIONCOLUMNID = '', v.COMMENTS = '' })
        return false
      }
    },
    getPurificationColumnName: function(value) {
      if (!value) return ''
      let c = this.purificationColumnsCollection.findWhere({PURIFICATIONCOLUMNID: value.toString()})
      return c ? c.get('NAME') : 'Not found'
    },
  }


}
</script>