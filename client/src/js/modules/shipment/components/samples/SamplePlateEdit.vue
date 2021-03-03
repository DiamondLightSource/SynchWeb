<template>
  <div class="content">
    <h1>Samples to edit</h1>

    <div class="la puck_controls">
      <a class="button" @click.prevent="$emit('clone-container')" href="#" title="Clone entire plate from first sample"><i class="fa fa-plus"></i> Clone from First Sample</a>
      <a class="button" @click.prevent="$emit('clear-container')" href="#" title="Clear entire plate"><i class="fa fa-times"></i> Clear Plate</a>
    </div>

    <table-component
      :headers="sampleHeaders"
      :data="inputValue"
      actions="Actions"
      >
      <template slot="content" slot-scope="{ row }" v-if="editRowLocation && editRowLocation == row['LOCATION']">
        <td>{{row['LOCATION']}}</td>
        <validation-provider tag="td" :name="'Acronym-'+sample['LOCATION']" :rules="sample['NAME'] ? 'required|min_value:1' : ''" v-slot="{ errors }"><sw-select-input v-model="sample['PROTEINID']" :options="availableProteins" optionValueKey="PROTEINID" optionTextKey="ACRONYM" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <td><sw-select-input v-model="sample['TYPE']" optionValueKey="ID" optionTextKey="TYPE" :options="sampleTypes" /></td>
        <validation-provider tag="td" :name="'Name-'+sample['LOCATION']" :rules="sample['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''" v-slot="{ errors }"><sw-text-input v-model="sample['NAME']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <td><sw-select-input v-model="sample['PURIFICATIONCOLUMNID']" name="purification" :options="purificationColumns" optionValueKey="PURIFICATIONCOLUMNID" optionTextKey="NAME"/></td>
        <td><sw-text-input v-model="sample['VOLUME']"/></td>
        <validation-provider tag="td" :name="'ROBOTPLATETEMPERATURE-'+sample['LOCATION']" rules="decimal" v-if="showInputRobotExp" v-slot="{ errors }"><sw-text-input v-model="sample['ROBOTPLATETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <validation-provider tag="td" :name="'EXPOSURETEMPERATURE-'+sample['LOCATION']" rules="decimal" v-if="showInputRobotExp" v-slot="{ errors }"><sw-text-input v-model="sample['EXPOSURETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
      </template>

      <template slot="actions" slot-scope="{ row }">
        <!-- Send event back to parent to clone/clear this item -->
        <a class="button" href="" v-if="editRowLocation != row['LOCATION']" @click.prevent="onEditSample(row)"><i class="fa fa-edit"></i></a>
        <span v-else>
          <a class="button" href="" @click.prevent="onSaveSample(row)"><i class="fa fa-check"></i></a>
          <a class="button" href="" @click.prevent="onCancelEdit"><i class="fa fa-times"></i></a>
        </span>
        <a v-show="row['BLSAMPLEID']" class="button" :href="'/samples/sid/'+row['BLSAMPLEID']"><i class="fa fa-search"></i></a>
        <a v-show="row['BLSAMPLEID']" class="button" href="" @click.prevent="$emit('addto-sample-group', row['LOCATION'])"><i class="fa fa-cubes"></i></a>
      </template>
    </table-component>

  </div>
</template>

<script>
import EventBus from 'app/components/utils/event-bus.js'

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
  name: 'edit-sample-plate',
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
    },
    containerId: {
      type: Number
    }
  },
  data: function() {
    return {
      availableProteins: [],
      purificationColumns: [],
      purificationColumn: '',

      commonSampleHeaders: [
        {key: 'LOCATION', title: 'Location'},
        {key: 'ACRONYM', title: 'Acronym'},
        {key: 'TYPE', title: 'Type'},
        {key: 'NAME', title: 'Name'},
        {key: 'PURIFICATIONCOLUMNID', title: 'Column'},
        {key: 'VOLUME', title: 'Volume'},
      ],
      robotExperimentHeaders: [
        {key: 'ROBOTPLATETEMPERATURE', title: 'Robot Temperature'},
        {key: 'EXPOSURETEMPERATURE', title: 'Exposure Temperature'},
      ],
      sampleTypes: [
        {ID: 'Sample', TYPE: 'Sample'},
        {ID: 'Buffer', TYPE: 'Buffer'},
      ],
      editRowLocation: '',
      // When editing a row we use a temporary sample object as the model
      // Then if we cancel the edit, the original row data is not changed
      sample: {},
      tableKey: 0
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
  methods: {
    onSaveSample: function(row) {
      // Assumption that samples are in location order
      // Convert index, input[0] = location[1]
      let sampleIndex = +row['LOCATION']-1
      this.sample.CONTAINERID = this.containerId
      this.inputValue[sampleIndex] = Object.assign(this.inputValue[sampleIndex], this.sample)

      // Update sample ACRONYM if valid
      let acronym = this.getProteinAcronym(this.sample.PROTEINID)
      if (acronym) this.inputValue[sampleIndex]['ACRONYM'] = acronym

      this.$emit('save-sample', row['LOCATION'])
      // Reset temporary sample model
      this.sample = Object.assign({})
      this.editRowLocation = ''
    },
    onEditSample: function(row) {
      this.sample = Object.assign(this.sample, row)
      console.log("Edit sample in location " + row['LOCATION'])
      this.editRowLocation = row['LOCATION']
    },
    onCancelEdit: function() {
      this.editRowLocation = ''
      // Reset temporary sample model
      this.sample = Object.assign(this.sample, {})
    },
    // If a proteinId is updated we need to also update the text ACRONYM because its a plan text value
    // and not linked directly to the protein id value for each sample
    getProteinAcronym: function(id) {
      let protein = this.proteins.findWhere({PROTEINID: id})
      if (protein) return protein.get('ACRONYM')
      else return null
    },
  },
}
</script>