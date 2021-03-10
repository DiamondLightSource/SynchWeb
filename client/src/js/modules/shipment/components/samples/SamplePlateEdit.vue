<template>
  <div class="content">
    <h1>Samples to edit</h1>

    <div class="la puck_controls">
      <a class="button" @click.prevent="$emit('clone-container')" href="#" title="Clone entire plate from first sample"><i class="fa fa-plus"></i> Clone from First Sample</a>
      <a class="button" @click.prevent="$emit('clear-container')" href="#" title="Clear entire plate"><i class="fa fa-times"></i> Clear Plate</a>
    </div>

    <!-- Using a key to update the table once we have discovered purification columns -->
    <table-component
      :key="tableKey"
      :headers="sampleHeaders"
      :data="inputValue"
      actions="Actions"
      >
      <!--
        This is a bit more markup than we would like
        Two things at play. One we want to switch on/off editing table row
        The first commented block would do this.
        However, also each sample has a purification column id we want to display
        Hence we override the content block with a filtered view that also shows the column value rather than id
        An alternative solution would be to process the data and append a column value to the samples array in the parent
        Then we would need to update the appended value on every change...
        Swings.
        Roundabouts.
       -->
      <!--
        First version that displays values from samples but switches while content block on edit
        <template slot="content" slot-scope="{ row }" v-if="editRowLocation && editRowLocation == row['LOCATION']">
        <td>{{row['LOCATION']}}</td>
        <validation-provider tag="td" :name="'Acronym-'+sample['LOCATION']" :rules="sample['NAME'] ? 'required|min_value:1' : ''" v-slot="{ errors }"><base-input-select v-model="sample['PROTEINID']" :options="availableProteins" optionValueKey="PROTEINID" optionTextKey="ACRONYM" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <td><base-input-select v-model="sample['TYPE']" optionValueKey="ID" optionTextKey="TYPE" :options="sampleTypes" /></td>
        <validation-provider tag="td" :name="'Name-'+sample['LOCATION']" :rules="sample['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''" v-slot="{ errors }"><base-input-text v-model="sample['NAME']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <td><base-input-select v-model="sample['PURIFICATIONCOLUMNID']" name="purification" :options="purificationColumns" optionValueKey="PURIFICATIONCOLUMNID" optionTextKey="NAME"/></td>
        <td><base-input-text v-model="sample['VOLUME']"/></td>
        <validation-provider tag="td" :name="'ROBOTPLATETEMPERATURE-'+sample['LOCATION']" rules="decimal" v-if="showInputRobotFields" v-slot="{ errors }"><base-input-text v-model="sample['ROBOTPLATETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
        <validation-provider tag="td" :name="'EXPOSURETEMPERATURE-'+sample['LOCATION']" rules="decimal" v-if="showInputRobotFields" v-slot="{ errors }"><base-input-text v-model="sample['EXPOSURETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
      </template> -->

      <!--
        Second version that is more complex but allow showing filtered/parsed views directly
        Note use of validation-provider slim to avoid adding any markup
        Could use tag=span as well within validation-provider
      -->
      <template slot="content" slot-scope="{ row }">
        <td>{{row['LOCATION']}}</td>
        <td>
          <validation-provider v-if="editRowLocation == row['LOCATION']" slim :name="'Acronym-'+sample['LOCATION']" :rules="sample['NAME'] ? 'required|min_value:1' : ''" v-slot="{ errors }"><base-input-select v-model="sample['PROTEINID']" :options="availableProteins" optionValueKey="PROTEINID" optionTextKey="ACRONYM" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
          <span v-else>{{row['ACRONYM']}}</span>
        </td>
        <td>
          <base-input-select v-if="editRowLocation == row['LOCATION']" v-model="sample['TYPE']" optionValueKey="ID" optionTextKey="TYPE" :options="sampleTypes" />
          <span v-else>{{row['TYPE']}}</span>
        </td>
        <td>
          <validation-provider v-if="editRowLocation == row['LOCATION']" slim :name="'Name-'+sample['LOCATION']" :rules="sample['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''" v-slot="{ errors }"><base-input-text v-model="sample['NAME']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
          <span v-else>{{row['NAME']}}</span>
        </td>
        <!-- The problematic column id field... -->
        <td>
          <base-input-select v-if="editRowLocation == row['LOCATION']" v-model="sample['PURIFICATIONCOLUMNID']" name="purification" :options="purificationColumns" optionValueKey="PURIFICATIONCOLUMNID" optionTextKey="NAME"/>
          <span v-else>{{getPurificationColumnName(row['PURIFICATIONCOLUMNID'])}}</span>
        </td>
        <td>
          <base-input-text v-if="editRowLocation == row['LOCATION']" v-model="sample['VOLUME']"/>
          <span v-else>{{row['VOLUME']}}</span>
        </td>
        <td>
          <validation-provider v-if="editRowLocation == row['LOCATION'] && showInputRobotFields" slim :name="'ROBOTPLATETEMPERATURE-'+sample['LOCATION'] && showInputRobotFields" rules="decimal" v-slot="{ errors }"><base-input-text v-model="sample['ROBOTPLATETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
          <span v-else>{{row['ROBOTPLATETEMPERATURE']}}</span>
        </td>
        <td>
          <validation-provider v-if="editRowLocation == row['LOCATION'] && showInputRobotFields" slim :name="'EXPOSURETEMPERATURE-'+sample['LOCATION']" rules="decimal" v-slot="{ errors }"><base-input-text v-model="sample['EXPOSURETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
          <span v-else>{{row['EXPOSURETEMPERATURE']}}</span>
        </td>
      </template>

      <template slot="actions" slot-scope="{ row }">
        <!-- Button to edit this row -->
        <a class="button" href="" v-if="editRowLocation != row['LOCATION']" @click.prevent="onEditSample(row)"><i class="fa fa-edit"></i></a>
        <!-- If we are editing a row - show the save/cancel buttons -->
        <span v-else>
          <a class="button" href="" @click.prevent="onSaveSample(row)"><i class="fa fa-check"></i></a>
          <a class="button" href="" @click.prevent="onCancelEdit"><i class="fa fa-times"></i></a>
        </span>
        <!-- Other row actions -->
        <a v-show="row['BLSAMPLEID']" class="button" :href="'/samples/sid/'+row['BLSAMPLEID']"><i class="fa fa-search"></i></a>
        <a v-show="row['BLSAMPLEID']" class="button" href="" @click.prevent="$emit('addto-sample-group', row['LOCATION'])"><i class="fa fa-cubes"></i></a>
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

// Property to compare for extra columns
const EXPERIMENT_TYPE_ROBOT = 'Robot'

export default {
  name: 'edit-sample-plate',
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
        {key: 'LOCATION', title: 'location'},
        {key: 'ACRONYM', title: 'acronym'},
        {key: 'TYPE', title: 'type'},
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
      this.tableKey += 1
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
    // Currently the container experiment type is a text string!
    // In future we could check against a typeid
    sampleHeaders: function() {
      let headers = Object.assign([], this.commonSampleHeaders)
      if (this.experimentKind == EXPERIMENT_TYPE_ROBOT) {
        for (var i=0; i<this.robotExperimentHeaders.length; i++) headers.push(this.robotExperimentHeaders[i])
      }
      return headers
    },
    showInputRobotFields: function() {
      if (this.experimentKind && this.experimentKind == EXPERIMENT_TYPE_ROBOT) return true
      else return false
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
    getPurificationColumnName: function(value) {
      console.log("PURIFICATION COL VALUE: " + value)
      if (!value) return ''
      let c = this.purificationColumnsCollection.findWhere({PURIFICATIONCOLUMNID: value.toString()})
      return c ? c.get('NAME') : 'Not found'
    }

  },
}
</script>