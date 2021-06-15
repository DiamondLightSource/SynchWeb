<template>
  <div class="content">
    <h1>Samples</h1>

    <div class="la puck_controls">
      <a class="button clonepuck" @click.prevent="$emit('clone-container')" href="#" title="Clone entire plate from first sample"><i class="fa fa-plus"></i> Clone from First Sample</a>
      <a class="button clearpuck" @click.prevent="$emit('clear-container')" href="#" title="Clear entire plate"><i class="fa fa-times"></i> Clear Plate</a>
    </div>

    <table-component
      :headers="sampleHeaders"
      :data="inputValue"
      actions="Actions"
      >
      <template slot="content" slot-scope="{ row }">
        <td>{{row['LOCATION']}}</td>
        <validation-provider tag="td" :name="'Acronym-'+row['LOCATION']" :rules="row['NAME'] ? 'required|min_value:1' : ''" v-slot="{ errors }"><base-input-select v-model="row['PROTEINID']" name="proteins" :options="availableProteins" optionValueKey="PROTEINID" optionTextKey="ACRONYM" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <validation-provider tag="td" :name="'Name-'+row['LOCATION']" :rules="row['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''" v-slot="{ errors }"><base-input-text v-model="row['NAME']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <validation-provider tag="td" :name="'VOLUME-'+row['LOCATION']" rules="decimal|min_value:10|max_value:100" v-slot="{ errors }"><base-input-text v-model="row['VOLUME']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <validation-provider tag="td" :name="'PURIFICATIONCOLUMNID'+row['LOCATION']" v-if="showInputHplcExp" v-slot="{ errors }"><base-input-select v-model="row['PURIFICATIONCOLUMNID']" name="purification" :quiet="true" :errorMessage="errors[0]" :options="purificationColumns" optionValueKey="PURIFICATIONCOLUMNID" optionTextKey="NAME"/></validation-provider>
        <validation-provider tag="td" :name="'COMMENTS-'+row['LOCATION']" rules="alpha_dash|max:1000" v-if="showInputHplcExp" v-slot="{ errors }"><base-input-text v-model="row['COMMENTS']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <validation-provider tag="td" :name="'ROBOTPLATETEMPERATURE-'+row['LOCATION']" rules="decimal" v-if="showInputRobotExp" v-slot="{ errors }"><base-input-text v-model="row['ROBOTPLATETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <validation-provider tag="td" :name="'EXPOSURETEMPERATURE-'+row['LOCATION']" rules="decimal" v-if="showInputRobotExp" v-slot="{ errors }"><base-input-text v-model="row['EXPOSURETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
      </template>

      <template slot="actions" slot-scope="{ row }">
        <!-- Send event back to parent to clone/clear this item -->
        <a class="button" href="" @click.prevent="$emit('clone-sample', row['LOCATION'])"><i class="fa fa-plus"></i></a>
        <a class="button" href="" @click.prevent="$emit('clear-sample', row['LOCATION'])"><i class="fa fa-times"></i></a>
      </template>
    </table-component>

  </div>
</template>

<script>
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import Table from 'app/components/table.vue'

import PurificationColumns from 'modules/shipment/collections/purificationcolumns'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

const EXPERIMENT_TYPE_ROBOT = 22
const EXPERIMENT_TYPE_HPLC = 21

export default {
  name: 'new-sample-plate',
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider,
    'table-component': Table,
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
      type: Number,
      default: 0
    }
  },
  data: function() {
    return {
      purificationColumns: [],
      purificationColumn: '',

      commonSampleHeaders: [
        {key: 'LOCATION', title: 'Location'},
        {key: 'PROTEINID', title: 'Acronym'},
        {key: 'NAME', title: 'Name'},
        {key: 'VOLUME', title: 'Volume (uL)'},
      ],
      robotExperimentHeaders: [
        {key: 'ROBOTPLATETEMPERATURE', title: 'Robot Temperature'},
        {key: 'EXPOSURETEMPERATURE', title: 'Exposure Temperature'},
      ],
      hplcExperimentHeaders: [
        {key: 'PURIFICATIONCOLUMNID', title: 'Column'},
        {key: 'COMMENTS', title: 'Comment: Buffer Location'},
      ],
      availableProteins: [],
    }
  },
  created: function() {
    console.log("Sample Plate Editor - Experiment kind: " + this.experimentKind)
    this.purificationColumnsCollection = new PurificationColumns()
    this.purificationColumns = []

    this.$store.dispatch('getCollection', this.purificationColumnsCollection).then( (result) => {
      this.purificationColumns = result.toJSON()
    })

    this.availableProteins = this.proteins.toJSON()
  },
  computed: {
    // Trick to allow us to set/get passed model
    inputValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    // Depending on the experiment type, we need a different table structure
    sampleHeaders: function() {
      let headers = Object.assign([], this.commonSampleHeaders)
      if (this.experimentKind == EXPERIMENT_TYPE_ROBOT) {
        for (var i=0; i<this.robotExperimentHeaders.length; i++) headers.push(this.robotExperimentHeaders[i])
      }
      if (this.experimentKind == EXPERIMENT_TYPE_HPLC) {
        for (var i=0; i<this.hplcExperimentHeaders.length; i++) headers.push(this.hplcExperimentHeaders[i])
      }
      
      return headers
    },
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
    }
  },
}
</script>