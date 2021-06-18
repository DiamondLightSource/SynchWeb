<template>
  <div class="content">
    <h1>Samples</h1>

    <div class="la puck_controls">
      <a class="button clonepuck" @click.prevent="$emit('clone-container')" href="#" title="Clone entire plate from first sample"><i class="fa fa-plus"></i> Clone from First Sample</a>
      <a class="button clearpuck" @click.prevent="$emit('clear-container')" href="#" title="Clear entire plate"><i class="fa fa-times"></i> Clear Plate</a>
    </div>

    <!-- 
      Validation providers expose an error slot, v-slot="{errors}".
      We don't show them here because it's hard to fit them into the table.
      Instead they can be picked up by the validation-observer that wraps the parent form.

      The rules for sample name and protein id are dependent on each other. So if there is a protein id, there must be a name and vice versa.
    -->
    <table-component
      :headers="sampleHeaders"
      :data="inputValue"
      actions="Actions"
      >
      <template slot="content" slot-scope="{ row }">
        <td>{{row['LOCATION']}}</td>
        <validation-provider tag="td" :rules="row['NAME'] ? 'required|min_value:1' : ''" name="Protein" :vid="'protein-'+row['LOCATION']" v-slot="{ errors }">
          <base-input-select v-model="row['PROTEINID']" name="proteins" :options="availableProteins" optionValueKey="PROTEINID" optionTextKey="ACRONYM" :quiet="true" :errorMessage="errors[0]"/>
        </validation-provider>
        <validation-provider tag="td" :rules="row['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''" name="Sample Name" :vid="'sample-name-'+row['LOCATION']"  v-slot="{ errors }">
          <base-input-text v-model="row['NAME']" :quiet="true" :errorMessage="errors[0]"/>
        </validation-provider>
        <validation-provider tag="td" rules="decimal|min_value:10|max_value:100" name="Volume" :vid="'volume-'+row['LOCATION']" v-slot="{ errors }">
          <base-input-text v-model="row['VOLUME']" :quiet="true" :errorMessage="errors[0]"/>
        </validation-provider>
        <validation-provider tag="td" v-if="showInputHplcExp" v-slot="{ errors }">
          <base-input-select v-model="row['PURIFICATIONCOLUMNID']" name="purification" :quiet="true" :errorMessage="errors[0]" :options="purificationColumns" optionValueKey="PURIFICATIONCOLUMNID" optionTextKey="NAME"/>
        </validation-provider>
        <validation-provider tag="td" v-if="showInputHplcExp" rules="alpha_dash|max:1000" name="Comments" :vid="'comments-'+row['LOCATION']" v-slot="{ errors }">
          <base-input-text v-model="row['COMMENTS']" :quiet="true" :errorMessage="errors[0]"/>
        </validation-provider>
        <validation-provider tag="td" v-if="showInputRobotExp" rules="decimal" name="Plate Temperature" :vid="'plate-temperature-'+row['LOCATION']" v-slot="{ errors }">
          <base-input-text v-model="row['ROBOTPLATETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/>
        </validation-provider>
        <validation-provider tag="td" v-if="showInputRobotExp" rules="decimal" name="Exposure Temperature" :vid="'exposure-temperature-'+row['LOCATION']" v-slot="{ errors }">
          <base-input-text v-model="row['EXPOSURETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/>
        </validation-provider>
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
      experimentHeaders: {
        'robot': [
          {key: 'ROBOTPLATETEMPERATURE', title: 'Robot Temperature'},
          {key: 'EXPOSURETEMPERATURE', title: 'Exposure Temperature'},
        ],
        'hplc': [
          {key: 'PURIFICATIONCOLUMNID', title: 'Column'},
          {key: 'COMMENTS', title: 'Comment: Buffer Location'},
        ]
      },
      availableProteins: [],
    }
  },
  created: function() {
    this.purificationColumnsCollection = new PurificationColumns()
    this.purificationColumns = []

    this.$store.dispatch('getCollection', this.purificationColumnsCollection).then( (result) => {
      this.purificationColumns = result.toJSON()
    })

    this.availableProteins = this.proteins.toJSON()
    this.$emit('test-event')
  },
  computed: {
    // Trick to allow us to set/get passed model
    inputValue: {
      get() {
        return this.$store.state.samples.samples
      },
      set(val) {
        this.$store.commit('samples/set', val)
      }
    },
    
    // Depending on the experiment type, we need a different table structure
    sampleHeaders: function() {
      let headers = Object.assign([], this.commonSampleHeaders)
      if (this.experimentKind == EXPERIMENT_TYPE_ROBOT) {
        for (var i=0; i<this.experimentHeaders['robot'].length; i++) headers.push(this.experimentHeaders['robot'][i])
      }
      if (this.experimentKind == EXPERIMENT_TYPE_HPLC) {
        for (var i=0; i<this.experimentHeaders['hplc'].length; i++) headers.push(this.experimentHeaders['hplc'][i])
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