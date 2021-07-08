<template>
  <div class="content">
    <h1>Samples</h1>
    <table-component
      :headers="sampleHeaders"
      :data="inputValue"
      actions="Actions"
      >
      <!--
        Second version that is more complex but allow showing filtered/parsed views directly
        Note use of validation-provider slim to avoid adding any markup
        Could use tag=span as well within validation-provider
      -->
      <template slot="content" slot-scope="{ row }">
        <td>{{row['LOCATION']}}</td>
        <td>
          <validation-provider v-if="isEditRowLocation(row)" slim :rules="sample['NAME'] ? 'required|min_value:1' : ''" v-slot="{ errors }">
            <base-input-select v-model="sample['PROTEINID']" :options="availableProteins" optionValueKey="PROTEINID" optionTextKey="ACRONYM" :quiet="true" :errorMessage="errors[0]"/>
          </validation-provider>
          <span v-else>{{row['ACRONYM']}}</span>
        </td>
        <td>
          <validation-provider v-if="isEditRowLocation(row)" slim :rules="sample['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''" v-slot="{ errors }">
            <base-input-text v-model="sample['NAME']" :quiet="true" :errorMessage="errors[0]"/>
          </validation-provider>
          <span v-else>{{row['NAME']}}</span>
        </td>
        <td>
          <validation-provider v-if="isEditRowLocation(row)" slim rules="decimal|min_value:10|max_value:100" v-slot="{ errors }">
            <base-input-text v-model="sample['VOLUME']" :quiet="true" :errorMessage="errors[0]"/>
          </validation-provider>
          <span v-else>{{row['VOLUME']}}</span>
        </td>
        <td>
          <validation-provider v-if="isEditRowLocation(row)" slim rules="decimal" v-slot="{ errors }">
            <base-input-text v-model="sample['ROBOTPLATETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/>
          </validation-provider>
          <span v-else>{{row['ROBOTPLATETEMPERATURE']}}</span>
        </td>
        <td>
          <validation-provider v-if="isEditRowLocation(row)" slim rules="decimal" v-slot="{ errors }">
            <base-input-text v-model="sample['EXPOSURETEMPERATURE']" :quiet="true" :errorMessage="errors[0]"/>
          </validation-provider>
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

import { ValidationObserver, ValidationProvider }  from 'vee-validate'


export default {
  name: 'sample-table-robot-view',
  mixins: [SampleTableMixin],
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
    experimentKind: {
      type: Number
    },
    containerId: {
      type: Number
    },
  },
  data: function() {
    return {
      commonSampleHeaders: SampleHeaders['common'],
      experimentHeaders: SampleHeaders['robot'],
    }
  },
}
</script>