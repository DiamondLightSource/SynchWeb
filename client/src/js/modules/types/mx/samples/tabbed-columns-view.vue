<template>
  <div>
    <div v-show="currentTab === 'basic'" class="tw-flex tw-w-full tw-items-center">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        :rules="sample['PROTEINID'] > -1 ? 'required' : ''"
        :name="`Sample ${sampleIndex + 1} Anomalous Scatterer`"
        :vid="`sample ${sampleIndex + 1} anomalous scatterer`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(sample['LOCATION'])"
          :options="anomalousOptionsList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :errorMessage="errors[0]"
          :quiet="true"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="ANOMALOUSSCATTERER"
        />
        <p v-else class="tw-text-center">{{ sample['ANOMALOUSSCATTERER'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        :name="`Sample ${sampleIndex + 1} Barcode`"
        :rules="sample['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`sample ${sampleIndex + 1} code`">
        <base-input-text
          v-if="canEditRow(sample['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          v-model="CODE"
        />
        <p v-else class="tw-text-center">{{ sample['CODE'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-1/2"
        :name="`Sample ${sampleIndex + 1} Comment`"
        :vid="`sample ${sampleIndex + 1} comment`">
        <base-input-text
          v-if="canEditRow(sample['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          v-model="COMMENTS"
        />
        <p v-else class="tw-text-center">{{ sample['COMMENTS'] }}</p>
      </validation-provider>
    </div>

    <div v-show="currentTab === 'extraFields'" class="tw-flex tw-w-full tw-items-center">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-3/12"
        :name="`Sample ${sampleIndex + 1} User Path`"
        :vid="`sample ${sampleIndex + 1} userpath`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(sample['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :quiet="true"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="USERPATH"
        />
        <p v-else class="tw-text-center">{{ sample['USERPATH'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-3/12"
        :name="`Sample ${sampleIndex + 1} Space Group`"
        :vid="`sample ${sampleIndex + 1} spacegroup`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(sample['LOCATION'])"
          :options="spaceGroupList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :quiet="true"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="SPACEGROUP"
        />
        <p v-else class="tw-text-center">{{ sample['SPACEGROUP'] }}</p>
      </validation-provider>


      <div class="tw-flex tw-items-center tw-px-3 tw-w-4/12 tw-flex-col">
        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-A`"
            :vid="`sample ${sampleIndex + 1} cell-a`"
            v-slot="{ errors }">
            <base-input-text
              v-if="canEditRow(sample['LOCATION'])"
              placeholderText="A"
              :quiet="true"
              type="number"
              :step="0.01"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="CELL_A"
            />
            <p v-else class="tw-text-center">{{ sample['CELL_A'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-B`"
            :vid="`sample ${sampleIndex + 1} cell-b`"
            v-slot="{ errors }">
            <base-input-text
              v-if="canEditRow(sample['LOCATION'])"
              placeholderText="B"
              :quiet="true"
              type="number"
              :step="0.01"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="CELL_B"
            />
            <p v-else class="tw-text-center">{{ sample['CELL_B'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-C`"
            :vid="`sample ${sampleIndex + 1} cell-c`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="canEditRow(sample['LOCATION'])"
              placeholderText="C"
              inputClass="tw-w-12 tw-h-8"
              type="number"
              :step="0.01"
              :errorMessage="errors[0]"
              :quiet="true"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="CELL_C"
            />
            <p v-else class="tw-text-center">{{ sample['CELL_C'] }}</p>
          </validation-provider>
        </div>


        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-ALPHA`"
            :vid="`sample ${sampleIndex + 1} cell-alpha`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="canEditRow(sample['LOCATION'])"
              placeholderText="α"
              inputClass="tw-w-12 tw-h-8"
              :quiet="true"
              type="number"
              :step="0.01"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="CELL_ALPHA"
            />
            <p v-else class="tw-text-center">{{ sample['CELL_ALPHA'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-BETA`"
            :vid="`sample ${sampleIndex + 1} cell-beta`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="canEditRow(sample['LOCATION'])"
              placeholderText="β"
              inputClass="tw-w-12 tw-h-8"
              type="number"
              :step="0.01"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              :quiet="true"
              v-model="CELL_BETA"
            />
            <p v-else class="tw-text-center">{{ sample['CELL_BETA'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-GAMMA`"
            :vid="`sample ${sampleIndex + 1} cell-gamma`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="canEditRow(sample['LOCATION'])"
              placeholderText="γ"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              :quiet="true"
              v-model="CELL_GAMMA"
            />
            <p v-else class="tw-text-center">{{ sample['CELL_GAMMA'] }}</p>
          </validation-provider>
        </div>
      </div>
    </div>

    <div v-show="currentTab === 'unattended'" class="tw-w-full tw-flex tw-items-center">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} Centering Method`"
        :rules="sample['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`sample ${sampleIndex + 1} centering method`"
        v-slot="{ errors }"
        >
        <base-input-select
          v-if="canEditRow(sample['LOCATION'])"
          :options="centeringMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="CENTRINGMETHOD"
        />
        <p v-else class="tw-text-center">{{ sample['CENTRINGMETHOD'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        :name="`Sample ${sampleIndex + 1} Experiment Kind`"
        :vid="`sample ${sampleIndex + 1} experiment kind`"
        :rules="sample['PROTEINID'] > -1 ? 'required' : ''"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(sample['LOCATION'])"
          :options="experimentKindList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="EXPERIMENTKIND"
        />
        <p v-else class="tw-text-center">{{ sample['EXPERIMENTKIND'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-20"
        :name="`Sample ${sampleIndex + 1} Energy`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD|numeric` : ''"
        :vid="`sample ${sampleIndex + 1} energy`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(sample['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          type="number"
          :step="1"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="ENERGY"
        />
        <p v-else class="tw-text-center">{{ sample['ENERGY'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} UDC Anomalous Scatterer`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD` : ''"
        :vid="`sample ${sampleIndex + 1} UDC anomalous scatterer`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(sample['LOCATION'])"
          :options="anomalousOptionsList"
          optionValueKey="value"
          inputClass="tw-w-full tw-h-8"
          optionTextKey="text"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="ANOMALOUSSCATTERER"
        />
        <p v-else class="tw-text-center">{{ sample['ANOMALOUSSCATTERER'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :rules="sample['PROTEINID'] > -1 ? 'required' : ''"
        :name="`Sample ${sampleIndex + 1} Screening Method`"
        :vid="`sample ${sampleIndex + 1} screening method`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(sample['LOCATION'])"
          :options="screeningMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="SCREENINGMETHOD"
        />
        <p v-else class="tw-text-center">{{ sample['SCREENINGMETHOD'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :rules="sample['PROTEINID'] > -1 ?  `required_if:sample ${sampleIndex + 1} screening method,none|decimal:2` : ''"
        :name="`Sample ${sampleIndex + 1} Required Resolution`"
        :vid="`sample ${sampleIndex + 1} required resolution`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(sample['LOCATION'])"
          type="number"
          :step="1"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :quiet="true"
          v-model="REQUIREDRESOLUTION"
        />
        <p v-else class="tw-text-center">{{ sample['REQUIREDRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} Minimum Resolution`"
        :rules="sample['PROTEINID'] > -1 ?  `required_if:sample ${sampleIndex + 1} screening method,all|decimal:2` : ''"
        :vid="`sample ${sampleIndex + 1} minimum resolution`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(sample['LOCATION'])"
          type="number"
          :step="1"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :quiet="true"
          v-model="MINIMUMRESOLUTION"
        />
        <p v-else class="tw-text-center">{{ sample['MINIMUMRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} No to Collect`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} screening method,best|numeric`: ''"
        :vid="`sample ${sampleIndex + 1} no to collect`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(sample['LOCATION'])"
          type="number"
          :step="1"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :quiet="true"
          v-model="SCREENINGCOLLECTVALUE"
        />
        <p v-else class="tw-text-center">{{ sample['SCREENINGCOLLECTVALUE'] }}</p>
      </validation-provider>
    </div>
  </div>
</template>

<script>
import { ValidationObserver, ValidationProvider }  from 'vee-validate'
import BaseSelectInput from 'app/components/base-input-select.vue'
import BaseTextInput from 'app/components/base-input-text.vue'
import MxSampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'
import VeeValidateCustomRules from 'app/mixins/vee-validate-custom-rules'

export default {
  name: 'tabbed-columns',
  mixins: [MxSampleTableMixin, VeeValidateCustomRules],
  components: {
    'base-input-select': BaseSelectInput,
    'base-input-text': BaseTextInput,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver
  },
  props: {
    sample: {
      type: Object,
      default: () => ({})
    },
    currentTab: {
      type: String,
      default: 'basic'
    },
    sampleIndex: {
      type: Number,
      required: true
    },
    currentEditingRow: {
      type: [String, null],
      default: null
    }

  },
  data() {
    return {}
  },
  methods: {
    canEditRow(location) {
      return !this.containerId || location === this.currentEditingRow
    }
  },
}
</script>
<style>
/* Chrome, Safari, Edge, Opera */
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>