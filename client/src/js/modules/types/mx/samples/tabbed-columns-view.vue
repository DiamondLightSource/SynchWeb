<template>
  <div>
    <div
      v-show="currentTab === 'basic'"
      class="tw-flex tw-w-full tw-items-center"
    >
      <extended-validation-provider
        :ref="`sample_${sampleIndex}_anomalous_scatterer`"
        class-names="tw-px-2 tw-w-32"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD` : ''"
        :name="`Sample ${sampleIndex + 1} Anomalous Scatterer`"
        :vid="`sample ${sampleIndex + 1} anomalous scatterer`"
      >
        <template #default="{ errors, inputChanged }">
          <base-input-select
            v-model="ANOMALOUSSCATTERER"
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="anomalousOptionsList"
            input-class="tw-w-full tw-h-8"
            option-value-key="value"
            option-text-key="text"
            :error-message="errors[0]"
            :quiet="true"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_barcode`"
        class-names="tw-px-2 tw-w-32"
        :name="`Sample ${sampleIndex + 1} Barcode`"
        :vid="`sample ${sampleIndex + 1} code`"
      >
        <template #default="{ errors, inputChanged }">
          <base-input-text
            v-model="CODE"
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            input-class="tw-w-full tw-h-8"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_comment`"
        class-names="tw-px-2 tw-w-1/4"
        :name="`Sample ${sampleIndex + 1} Comment`"
        :vid="`sample ${sampleIndex + 1} comment`"
      >
        <template #default="{ errors, inputChanged }">
          <base-input-text
            v-model="COMMENTS"
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            input-class="tw-w-full tw-h-8"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-py-1 tw-w-1/4"
        :class="sampleStatusDetails.className"
        :name="`Sample ${sampleIndex + 1} Status`"
        :vid="`sample ${sampleIndex + 1} status`"
      >
        <base-input-text
          v-model="sampleStatusDetails.name"
          input-class="tw-w-full tw-h-8"
          :disabled="true"
        />
      </validation-provider>
    </div>

    <div
      v-show="currentTab === 'extraFields'"
      class="tw-flex tw-w-full tw-items-center"
    >
      <extended-validation-provider
        :ref="`sample_${sampleIndex}_user_path`"
        class-names="tw-px-2 tw-w-3/12"
        :name="`Sample ${sampleIndex + 1} User Path`"
        :rules="sample['PROTEINID'] > -1 ? { regex: /^(\w+(\/\w+)?)$/ } : ''"
        :vid="`sample ${sampleIndex + 1} userpath`"
      >
        <template #default="{ errors, inputChanged }">
          <base-input-text
            v-model="USERPATH"
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            input-class="tw-w-full tw-h-8"
            :error-message="errors[0]"
            :quiet="true"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_space_group`"
        class-names="tw-px-2 tw-w-3/12"
        :name="`Sample ${sampleIndex + 1} Space Group`"
        :vid="`sample ${sampleIndex + 1} spacegroup`"
      >
        <template #default="{errors, inputChanged}">
          <base-input-select
            v-model="SPACEGROUP"
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="spaceGroupList"
            option-value-key="value"
            option-text-key="text"
            input-class="tw-w-full tw-h-8"
            :error-message="errors[0]"
            :quiet="true"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
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
            :vid="`sample ${sampleIndex + 1} cell-a`"
          >
            <template #default="{errors, inputChanged}">
              <base-input-text
                v-model="CELL_A"
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholder-text="A"
                :quiet="true"
                type="number"
                :step="0.01"
                input-class="tw-w-12 tw-h-8 tabbed-sample-column"
                :error-message="errors[0]"
                :error-class="errors[0] ? 'ferror' : ''"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>

          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_b`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-B`"
            :vid="`sample ${sampleIndex + 1} cell-b`"
          >
            <template #default="{ errors, inputChanged }">
              <base-input-text
                v-model="CELL_B"
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholder-text="B"
                :quiet="true"
                type="number"
                :step="0.01"
                input-class="tw-w-12 tw-h-8 tabbed-sample-column"
                :error-message="errors[0]"
                :error-class="errors[0] ? 'ferror' : ''"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>

          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_c`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-C`"
            :vid="`sample ${sampleIndex + 1} cell-c`"
          >
            <template #default="{errors, inputChanged}">
              <base-input-text
                v-model="CELL_C"
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholder-text="C"
                input-class="tw-w-12 tw-h-8 tabbed-sample-column"
                type="number"
                :step="0.01"
                :error-message="errors[0]"
                :quiet="true"
                :error-class="errors[0] ? 'ferror' : ''"
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
            :vid="`sample ${sampleIndex + 1} cell-alpha`"
          >
            <template #default="{errors, inputChanged}">
              <base-input-text
                v-model="CELL_ALPHA"
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholder-text="α"
                input-class="tw-w-12 tw-h-8 tabbed-sample-column"
                :quiet="true"
                type="number"
                :step="0.01"
                :error-message="errors[0]"
                :error-class="errors[0] ? 'ferror' : ''"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>

          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_beta`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-BETA`"
            :vid="`sample ${sampleIndex + 1} cell-beta`"
          >
            <template #default="{ errors, inputChanged }">
              <base-input-text
                v-model="CELL_BETA"
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholder-text="β"
                input-class="tw-w-12 tw-h-8 tabbed-sample-column"
                type="number"
                :step="0.01"
                :error-message="errors[0]"
                :error-class="errors[0] ? 'ferror' : ''"
                :quiet="true"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>

          <extended-validation-provider
            :ref="`sample_${sampleIndex}_cell_gamma`"
            class-names="tw-pb-1 tw-px-2"
            :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:2' : ''"
            :name="`Sample ${sampleIndex + 1} CELL-GAMMA`"
            :vid="`sample ${sampleIndex + 1} cell-gamma`"
          >
            <template #default="{errors, inputChanged}">
              <base-input-text
                v-model="CELL_GAMMA"
                :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
                placeholder-text="γ"
                input-class="tw-w-12 tw-h-8 tabbed-sample-column"
                type="number"
                :step="0.01"
                :error-message="errors[0]"
                :error-class="errors[0] ? 'ferror' : ''"
                :quiet="true"
                @value-changed="inputChanged"
              />
            </template>
          </extended-validation-provider>
        </div>
      </div>
    </div>

    <div
      v-show="currentTab === 'unattended'"
      class="tw-w-full tw-flex tw-items-center"
    >
      <extended-validation-provider
        :ref="`sample_${sampleIndex}_centring_method`"
        class-names="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} Centring Method`"
        :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''"
        :vid="`sample ${sampleIndex + 1} centring method`"
      >
        <template #default="{errors, inputChanged }">
          <base-input-select
            v-model="CENTRINGMETHOD"
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="centringMethodList"
            option-value-key="value"
            option-text-key="text"
            input-class="tw-w-full tw-h-8"
            :quiet="true"
            :error-message="errors[0]"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_experiment_kind`"
        class-names="tw-px-2 tw-w-32"
        :name="`Sample ${sampleIndex + 1} Experiment Kind`"
        :vid="`sample ${sampleIndex + 1} experiment kind`"
        :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''"
      >
        <template #default="{errors, inputChanged}">
          <base-input-select
            v-model="EXPERIMENTKIND"
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="experimentKindList"
            input-class="tw-w-full tw-h-8"
            option-value-key="value"
            option-text-key="text"
            :quiet="true"
            :error-message="errors[0]"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_energy`"
        class-names="tw-px-2 tw-w-20"
        :name="`Sample ${sampleIndex + 1} Energy`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD|non_zero_numeric` : ''"
        :vid="`sample ${sampleIndex + 1} energy`"
      >
        <template #default="{errors, inputChanged }">
          <base-input-text
            v-model="ENERGY"
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            input-class="tw-w-full tw-h-8 tabbed-sample-column"
            type="number"
            :step="1"
            :quiet="true"
            :error-message="errors[0]"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_anomalous_scatterer`"
        class-names="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} UDC Anomalous Scatterer`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD` : ''"
        :vid="`sample ${sampleIndex + 1} UDC anomalous scatterer`"
      >
        <template #default="{ errors, inputChanged }">
          <base-input-select
            v-model="ANOMALOUSSCATTERER"
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="anomalousOptionsList"
            option-value-key="value"
            input-class="tw-w-full tw-h-8"
            option-text-key="text"
            :quiet="true"
            :error-message="errors[0]"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_screening_method`"
        class-names="tw-px-2 tw-w-24"
        :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''"
        :name="`Sample ${sampleIndex + 1} Screening Method`"
        :vid="`sample ${sampleIndex + 1} screening method`"
      >
        <template #default="{ errors, inputChanged }">
          <base-input-select
            v-model="SCREENINGMETHOD"
            :is-disabled="!canEditRow(sample['LOCATION'], currentEditingRow)"
            :options="screeningMethodList"
            option-value-key="value"
            option-text-key="text"
            input-class="tw-w-full tw-h-8"
            :quiet="true"
            :error-message="errors[0]"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_required_resolution`"
        class-names="tw-px-2 tw-w-24"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} screening method,none|positive_decimal:4` : ''"
        :name="`Sample ${sampleIndex + 1} Required Resolution`"
        :vid="`sample ${sampleIndex + 1} required resolution`"
      >
        <template #default="{ errors, inputChanged}">
          <base-input-text
            v-model="REQUIREDRESOLUTION"
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow) || sample['SCREENINGMETHOD'] !== 'none'"
            type="number"
            :step="1"
            input-class="tw-w-full tw-h-8 tabbed-sample-column"
            :error-message="errors[0]"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            :quiet="true"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_minimum_resolution`"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} Minimum Resolution`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} screening method,all|positive_decimal:4` : ''"
        :vid="`sample ${sampleIndex + 1} minimum resolution`"
      >
        <template #default="{ errors, inputChanged }">
          <base-input-text
            v-model="MINIMUMRESOLUTION"
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow) || sample['SCREENINGMETHOD'] !== 'all'"
            type="number"
            :step="1"
            input-class="tw-w-full tw-h-8 tabbed-sample-column"
            :error-message="errors[0]"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            :quiet="true"
            @value-changed="inputChanged"
          />
        </template>
      </extended-validation-provider>

      <extended-validation-provider
        :ref="`sample_${sampleIndex}_minimum_resolution`"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} No to Collect`"
        :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} screening method,best|non_zero_numeric|min_value:1|max_value:5`: ''"
        :vid="`sample ${sampleIndex + 1} no to collect`"
      >
        <template #default="{ errors, inputChanged}">
          <base-input-text
            v-model="SCREENINGCOLLECTVALUE"
            :disabled="!canEditRow(sample['LOCATION'], currentEditingRow) || sample['SCREENINGMETHOD'] !== 'best'"
            type="number"
            :step="1"
            input-class="tw-w-full tw-h-8 tabbed-sample-column"
            :error-message="errors[0]"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
            :quiet="true"
            @value-changed="inputChanged"
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
  name: 'TabbedColumns',
  components: {
    'extended-validation-provider': ExtendedValidationProvider,
    'base-input-select': BaseSelectInput,
    'base-input-text': BaseTextInput,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver
  },
  mixins: [MxSampleTableMixin],
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
:deep() input.tabbed-sample-column[type="number"]::-webkit-outer-spin-button,
:deep() input.tabbed-sample-column[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
:deep() input.tabbed-sample-column[type="number"] {
  -moz-appearance: textfield;
}
:deep() input.tabbed-sample-column[type="number"]:disabled {
  @apply tw-bg-content-dark-background
}
</style>
