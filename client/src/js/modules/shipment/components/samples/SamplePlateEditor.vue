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
        <validation-provider tag="td" :name="'Acronym-'+row['LOCATION']" :rules="row['NAME'] ? 'required|min_value:1' : ''" v-slot="{ errors }"><sw-select-input v-model="row['PROTEINID']" name="proteins" :options="availableProteins" optionValueKey="PROTEINID" optionTextKey="ACRONYM" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <td><sw-select-input v-model="row['TYPE']" optionValueKey="ID" optionTextKey="TYPE" :options="sampleTypes"/></td>
        <validation-provider tag="td" :name="'Name-'+row['LOCATION']" :rules="row['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''" v-slot="{ errors }"><sw-text-input v-model="row['NAME']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <td><sw-select-input v-model="row['PURIFICATIONCOLUMNID']" name="purification" :options="purificationColumns" optionValueKey="PURIFICATIONCOLUMNID" optionTextKey="NAME"/></td>
        <td><sw-text-input v-model="row['VOLUME']"/></td>
        <validation-provider tag="td" :name="'ROBOTPLATETEMPERATURE-'+row['LOCATION']" rules="decimal" v-if="showInputRobotExp" v-slot="{ errors }"><sw-text-input v-model="row['ROBOTPLATETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <validation-provider tag="td" :name="'EXPOSURETEMPERATURE-'+row['LOCATION']" rules="decimal" v-if="showInputRobotExp" v-slot="{ errors }"><sw-text-input v-model="row['EXPOSURETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
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
import SwTextInput from 'app/components/forms/sw_text_input.vue'
import SwSelectInput from 'app/components/forms/sw_select_input.vue'
import SwTextAreaInput from 'app/components/forms/sw_textarea_input.vue'
import SwCheckboxInput from 'app/components/forms/sw_checkbox_input.vue'
import Table from 'app/components/utils/table.vue'

import PurificationColumns from 'modules/shipment/collections/purificationcolumns'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

const EXPERIMENT_TYPE_ROBOT = 22
const EXPERIMENT_TYPE_HPLC = 21

export default {
  name: 'new-sample-plate',
  components: {
    'sw-select-input': SwSelectInput,
    'sw-text-input': SwTextInput,
    'sw-textarea-input': SwTextAreaInput,
    'sw-checkbox-input': SwCheckboxInput,
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
    }
  },
  data: function() {
    return {
      purificationColumns: [],
      purificationColumn: '',

      commonSampleHeaders: [
        {key: 'LOCATION', title: 'Location'},
        {key: 'PROTEINID', title: 'Acronym'},
        {key: 'TYPE', title: 'Type'},
        {key: 'NAME', title: 'Name'},
        {key: 'COLUMN', title: 'Column'},
        {key: 'VOLUME', title: 'Volume'},
      ],
      robotExperimentHeaders: [
        {key: 'ROBOTPLATETEMPERATURE', title: 'Robot Temperature'},
        {key: 'EXPOSURETEMPERATURE', title: 'Exposure Temperature'},
      ],
      sampleTypes: [
        {ID: 'Sample', TYPE: 'Sample'},
        {ID: 'Buffer', TYPE: 'Buffer'},
      ]
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

    console.log("Sample Plate Editor - created with model: " + JSON.stringify(this.value))
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
      return headers
    },
    showInputRobotExp: function() {
      if (this.experimentKind && this.experimentKind == EXPERIMENT_TYPE_ROBOT) return true
      else {
        // We could clear any temperature values here if needed/required
        // this.inputValue.forEach( (v) => { v.ROBOTPLATETEMPERATURE = ''; v.EXPOSURETEMPERATURE = ''})
        return false
      }
    }
  },
}
</script>