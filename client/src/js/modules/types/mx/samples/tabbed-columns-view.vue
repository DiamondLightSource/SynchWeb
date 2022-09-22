<template>
  <div>
    <div v-show="currentTab === 'basic'" class="tw-flex tw-w-full tw-items-center">
      <extended-validation-provider
        class-names="tw-px-2 tw-w-32"
        :ref="`sample_${sampleIndex}_anomalous_scatterer`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD` : ''"
        :name="`Sample ${sampleIndex + 1} Anomalous Scatterer`"
        :vid="`sample ${sampleIndex + 1} anomalous scatterer`">
        <template  v-slot="{ errors, inputChanged }">
          <base-input-select
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="anomalousOptionsList"
            inputClass="tw-w-full tw-h-8"
            optionValueKey="value"
            optionTextKey="text"
            :errorMessage="errors[0]"
            :quiet="true"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="ANOMALOUSSCATTERER"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_barcode`"
        class-names="tw-px-2 tw-w-32"
        :name="`Sample ${sampleIndex + 1} Barcode`"
        :vid="`sample ${sampleIndex + 1} code`">
        <template  v-slot="{ errors, inputChanged }">
          <base-input-text
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            inputClass="tw-w-full tw-h-8"
            v-model="CODE"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_comment`"
        class-names="tw-px-2 tw-w-1/4"
        :name="`Sample ${sampleIndex + 1} Comment`"
        :vid="`sample ${sampleIndex + 1} comment`">
        <template v-slot="{ errors, inputChanged }">
          <base-input-text
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            inputClass="tw-w-full tw-h-8"
            v-model="COMMENTS"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-py-1 tw-w-1/4"
        :class="sampleStatusDetails.className"
        :name="`Sample ${sampleIndex + 1} Status`"
        :vid="`sample ${sampleIndex + 1} status`">
        <base-input-text
          inputClass="tw-w-full tw-h-8"
          v-model="sampleStatusDetails.name"
          :disabled="true"
        />
      </validation-provider>
    </div>

    <div v-show="currentTab === 'extraFields'" class="tw-flex tw-w-full tw-items-center">
      <extended-validation-provider
        :ref="`sample_${sampleIndex}_user_path`"
        class-names="tw-px-2 tw-w-3/12"
        :name="`Sample ${sampleIndex + 1} User Path`"
        :rules="sample['PROTEINID'] > -1 ? { regex: /^(\w+(\/\w+)?)$/ } : ''"
        :vid="`sample ${sampleIndex + 1} userpath`">
        <template v-slot="{ errors, inputChanged }">
          <base-input-text
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            inputClass="tw-w-full tw-h-8"
            :errorMessage="errors[0]"
            :quiet="true"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="USERPATH"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_space_group`"
        class-names="tw-px-2 tw-w-3/12"
        :name="`Sample ${sampleIndex + 1} Space Group`"
        :vid="`sample ${sampleIndex + 1} spacegroup`">
        <template v-slot="{errors, inputChanged}">
          <base-input-select
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="spaceGroupList"
            optionValueKey="value"
            optionTextKey="text"
            inputClass="tw-w-full tw-h-8"
            :errorMessage="errors[0]"
            :quiet="true"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="SPACEGROUP"
            @value-changed="inputChanged"
          />

        </template>
      </extended-validation-provider>


      <div class="tw-flex tw-items-center tw-px-3 tw-w-4/12 tw-flex-col">
        <div class="tw-flex tw-w-full tw-justify-center">
          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_a`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-A`"
            :vid="`sample ${sampleIndex + 1} cell-a`">
            <template v-slot="{errors, inputChanged}">
              <base-input-text
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholderText="A"
                :quiet="true"
                type="number"
                :step="0.01"
                inputClass="tw-w-12 tw-h-8 tabbed-sample-column"
                :errorMessage="errors[0]"
                :errorClass="errors[0] ? 'ferror' : ''"
                v-model="CELL_A"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>

          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_b`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-B`"
            :vid="`sample ${sampleIndex + 1} cell-b`">
            <template v-slot="{ errors, inputChanged }">
              <base-input-text
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholderText="B"
                :quiet="true"
                type="number"
                :step="0.01"
                inputClass="tw-w-12 tw-h-8 tabbed-sample-column"
                :errorMessage="errors[0]"
                :errorClass="errors[0] ? 'ferror' : ''"
                v-model="CELL_B"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>

          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_c`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-C`"
            :vid="`sample ${sampleIndex + 1} cell-c`">
            <template v-slot="{errors, inputChanged}">
              <base-input-text
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholderText="C"
                inputClass="tw-w-12 tw-h-8 tabbed-sample-column"
                type="number"
                :step="0.01"
                :errorMessage="errors[0]"
                :quiet="true"
                :errorClass="errors[0] ? 'ferror' : ''"
                v-model="CELL_C"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>
        </div>


        <div class="tw-flex tw-w-full tw-justify-center">
          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_alpha`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-ALPHA`"
            :vid="`sample ${sampleIndex + 1} cell-alpha`">
            <template v-slot="{errors, inputChanged}">
              <base-input-text
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholderText="α"
                inputClass="tw-w-12 tw-h-8 tabbed-sample-column"
                :quiet="true"
                type="number"
                :step="0.01"
                :errorMessage="errors[0]"
                :errorClass="errors[0] ? 'ferror' : ''"
                v-model="CELL_ALPHA"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>

          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_beta`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-BETA`"
            :vid="`sample ${sampleIndex + 1} cell-beta`">
            <template v-slot="{ errors, inputChanged }">
              <base-input-text
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholderText="β"
                inputClass="tw-w-12 tw-h-8 tabbed-sample-column"
                type="number"
                :step="0.01"
                :errorMessage="errors[0]"
                :errorClass="errors[0] ? 'ferror' : ''"
                :quiet="true"
                v-model="CELL_BETA"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>

          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_gamma`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-GAMMA`"
            :vid="`sample ${sampleIndex + 1} cell-gamma`">
            <template v-slot="{errors, inputChanged}">
              <base-input-text
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholderText="γ"
                inputClass="tw-w-12 tw-h-8 tabbed-sample-column"
                type="number"
                :step="0.01"
                :errorMessage="errors[0]"
                :errorClass="errors[0] ? 'ferror' : ''"
                :quiet="true"
                v-model="CELL_GAMMA"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>
        </div>
      </div>
    </div>

    <div v-show="currentTab === 'unattended'" class="tw-w-full tw-flex tw-items-center">
      <extended-validation-provider
        :ref="`sample_${sampleIndex}_centring_method`"
        class-names="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} Centring Method`"
        :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''"
        :vid="`sample ${sampleIndex + 1} centring method`">
        <template v-slot="{errors, inputChanged }">
          <base-input-select
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="centringMethodList"
            optionValueKey="value"
            optionTextKey="text"
            inputClass="tw-w-full tw-h-8"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="CENTRINGMETHOD"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_experiment_kind`"
        class-names="tw-px-2 tw-w-32"
        :name="`Sample ${sampleIndex + 1} Experiment Kind`"
        :vid="`sample ${sampleIndex + 1} experiment kind`"
        :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''">
        <template v-slot="{errors, inputChanged}">
          <base-input-select
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="experimentKindList"
            inputClass="tw-w-full tw-h-8"
            optionValueKey="value"
            optionTextKey="text"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="EXPERIMENTKIND"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_energy`"
        class-names="tw-px-2 tw-w-20"
        :name="`Sample ${sampleIndex + 1} Energy`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD|non_zero_numeric` : ''"
        :vid="`sample ${sampleIndex + 1} energy`">
        <template v-slot="{errors, inputChanged }">
          <base-input-text
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            inputClass="tw-w-full tw-h-8 tabbed-sample-column"
            type="number"
            :step="1"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="ENERGY"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_anomalous_scatterer`"
        class-names="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} UDC Anomalous Scatterer`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD` : ''"
        :vid="`sample ${sampleIndex + 1} UDC anomalous scatterer`">
        <template v-slot="{ errors, inputChanged }">
          <base-input-select
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="anomalousOptionsList"
            optionValueKey="value"
            inputClass="tw-w-full tw-h-8"
            optionTextKey="text"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="ANOMALOUSSCATTERER"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_screening_method`"
        class-names="tw-px-2 tw-w-24"
        :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''"
        :name="`Sample ${sampleIndex + 1} Screening Method`"
        :vid="`sample ${sampleIndex + 1} screening method`">
        <template v-slot="{ errors, inputChanged }">
          <base-input-select
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="screeningMethodList"
            optionValueKey="value"
            optionTextKey="text"
            inputClass="tw-w-full tw-h-8"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="SCREENINGMETHOD"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_required_resolution`"
        class-names="tw-px-2 tw-w-24"
        :rules="sample['PROTEINID'] > -1 ?  `required_if:sample ${sampleIndex + 1} screening method,none|positive_decimal:4` : ''"
        :name="`Sample ${sampleIndex + 1} Required Resolution`"
        :vid="`sample ${sampleIndex + 1} required resolution`">
        <template v-slot="{ errors, inputChanged}">
          <base-input-text
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow) || sample['SCREENINGMETHOD'] !== 'none'"
            type="number"
            :step="1"
            inputClass="tw-w-full tw-h-8 tabbed-sample-column"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            :quiet="true"
            v-model="REQUIREDRESOLUTION"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_minimum_resolution`"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} Minimum Resolution`"
        :rules="sample['PROTEINID'] > -1 ?  `required_if:sample ${sampleIndex + 1} screening method,all|positive_decimal:4` : ''"
        :vid="`sample ${sampleIndex + 1} minimum resolution`">
        <template v-slot="{ errors, inputChanged }">
          <base-input-text
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow) || sample['SCREENINGMETHOD'] !== 'all'"
            type="number"
            :step="1"
            inputClass="tw-w-full tw-h-8 tabbed-sample-column"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            :quiet="true"
            v-model="MINIMUMRESOLUTION"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_no_to_collect`"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} No to Collect`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} screening method,best|non_zero_numeric|min_value:1|max_value:5`: ''"
        :vid="`sample ${sampleIndex + 1} no to collect`">
        <template v-slot="{ errors, inputChanged}">
          <base-input-text
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow) || sample['SCREENINGMETHOD'] !== 'best'"
            type="number"
            :step="1"
            inputClass="tw-w-full tw-h-8 tabbed-sample-column"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            :quiet="true"
            v-model="SCREENINGCOLLECTVALUE"
            @value-changed="inputChanged"
            @input="handleCollectBestNValue($event, 'SCREENINGCOLLECTVALUE', 'SCREENINGCOLLECTVALUE', sample['SAMPLEGROUP'])"
          />

        </template>
      </extended-validation-provider>
    </div>
  </div>
</template>

<script>
import { ValidationObserver, ValidationProvider }  from 'vee-validate'
import BaseSelectInput from 'app/components/base-input-select.vue'
import BaseTextInput from 'app/components/base-input-text.vue'
import MxSampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'
import ExtendedValidationProvider from 'app/components/extended-validation-provider.vue'

export default {
  name: 'tabbed-columns',
  mixins: [MxSampleTableMixin],
  components: {
    'extended-validation-provider': ExtendedValidationProvider,
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
  methods: {},
}
</script>
<style scoped>
/* Chrome, Safari, Edge, Opera */
>>> input.tabbed-sample-column[type="number"]::-webkit-outer-spin-button,
>>> input.tabbed-sample-column[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
>>> input.tabbed-sample-column[type="number"] {
  -moz-appearance: textfield;
}
>>> input.tabbed-sample-column[type="number"]:disabled {
  @apply tw-bg-content-dark-background
}
</style>
