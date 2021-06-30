<template>
    <!-- 
      Validation providers expose an error slot, v-slot="{errors}".
      We don't show them here because it's hard to fit them into the table.
      Instead they can be picked up by the validation-observer that wraps the parent form.

      The rules for sample name and protein id are dependent on each other. So if there is a protein id, there must be a name and vice versa.
    -->  
    <div class="content">
      <h1>Samples</h1>

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
        <validation-provider tag="td" rules="decimal" name="Plate Temperature" :vid="'plate-temperature-'+row['LOCATION']" v-slot="{ errors }">
          <base-input-text v-model="row['ROBOTPLATETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/>
        </validation-provider>
        <validation-provider tag="td" rules="decimal" name="Exposure Temperature" :vid="'exposure-temperature-'+row['LOCATION']" v-slot="{ errors }">
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

import { SampleHeaders } from 'modules/types/saxs/samples/experiments/sample-table-map.js'
import { SampleTableMixin } from 'modules/types/saxs/samples/experiments/sample-table-mixin.js'

import { ValidationProvider }  from 'vee-validate'

export default {
  name: 'new-sample-plate-robot',
  mixins: [SampleTableMixin],
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
    'validation-provider': ValidationProvider,
    'table-component': Table,
  },

  data: function() {
    return {
      commonSampleHeaders: SampleHeaders['common'],
      experimentHeaders: SampleHeaders['robot'],
    }
  },
}
</script>