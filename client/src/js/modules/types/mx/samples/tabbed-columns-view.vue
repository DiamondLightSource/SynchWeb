<template>
  <div>
    <div v-show="currentTab === 'basic'" class="tw-flex tw-w-full tw-items-center">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :name="`Sample ${sampleIndex + 1} Anomalous Scatterer`"
        :vid="`sample ${sampleIndex + 1} anomalous scatterer`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="anomalousOptionsList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :errorMessage="errors[0]"
          v-model="inputValue[sampleIndex]['ANOMALOUSSCATTERER']"
          :quiet="true"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['ANOMALOUSSCATTERER'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        :name="`Sample ${sampleIndex + 1} Barcode`"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`sample ${sampleIndex + 1} code`">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          v-model="inputValue[sampleIndex]['CODE']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['CODE'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-1/2"
        :name="`Sample ${sampleIndex + 1} Comment`"
        :vid="`sample ${sampleIndex + 1} comment`">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          v-model="inputValue[sampleIndex]['COMMENTS']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['COMMENTS'] }}</p>
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
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          v-model="inputValue[sampleIndex]['USERPATH']"
          :errorMessage="errors[0]"
          :quiet="true"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['USERPATH'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-3/12"
        :name="`Sample ${sampleIndex + 1} Space Group`"
        :vid="`sample ${sampleIndex + 1} spacegroup`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="spaceGroupList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          v-model="inputValue[sampleIndex]['SPACEGROUP']"
          :errorMessage="errors[0]"
          :quiet="true"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['SPACEGROUP'] }}</p>
      </validation-provider>


      <div class="tw-flex tw-items-center tw-px-3 tw-w-4/12 tw-flex-col">
        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :name="`Sample ${sampleIndex + 1} CELL-A`"
            :vid="`sample ${sampleIndex + 1} cell-a`"
            v-slot="{ errors }">
            <base-input-text
              v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
              placeholderText="A"
              :quiet="true"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="inputValue[sampleIndex]['CELL_A']"
            />
            <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['CELL_A'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :name="`Sample ${sampleIndex + 1} CELL-B`"
            :vid="`sample ${sampleIndex + 1} cell-b`"
            v-slot="{ errors }">
            <base-input-text
              v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
              placeholderText="B"
              :quiet="true"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="inputValue[sampleIndex]['CELL_B']"
            />
            <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['CELL_B'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :name="`Sample ${sampleIndex + 1} CELL-C`"
            :vid="`sample ${sampleIndex + 1} cell-c`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
              placeholderText="C"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :quiet="true"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="inputValue[sampleIndex]['CELL_C']"
            />
            <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['CELL_C'] }}</p>
          </validation-provider>
        </div>


        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :name="`Sample ${sampleIndex + 1} CELL-ALPHA`"
            :vid="`sample ${sampleIndex + 1} cell-alpha`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
              placeholderText="α"
              inputClass="tw-w-12 tw-h-8"
              :quiet="true"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="inputValue[sampleIndex]['CELL_ALPHA']"
            />
            <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['CELL_ALPHA'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :name="`Sample ${sampleIndex + 1} CELL-BETA`"
            :vid="`sample ${sampleIndex + 1} cell-beta`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
              placeholderText="β"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              v-model="inputValue[sampleIndex]['CELL_BETA']"
              :errorClass="errors[0] ? 'ferror' : ''"
              :quiet="true"
            />
            <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['CELL_BETA'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            :name="`Sample ${sampleIndex + 1} CELL-GAMMA`"
            :vid="`sample ${sampleIndex + 1} cell-gamma`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
              placeholderText="γ"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              v-model="inputValue[sampleIndex]['CELL_GAMMA']"
              :quiet="true"
            />
            <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['CELL_GAMMA'] }}</p>
          </validation-provider>
        </div>
      </div>
    </div>

    <div v-show="currentTab === 'unattended'" class="tw-w-full tw-flex tw-items-center">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} Centering Method`"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && allowUDC ? 'required' : ''"
        :vid="`sample ${sampleIndex + 1} centering method`"
        v-slot="{ errors }"
        >
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :is-disabled="!allowUDC"
          :options="centeringMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['CENTRINGMETHOD']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['CENTRINGMETHOD'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        :name="`Sample ${sampleIndex + 1} Experiment Kind`"
        :vid="`sample ${sampleIndex + 1} experiment kind`"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && allowUDC ? 'required' : ''"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :is-disabled="!allowUDC"
          :options="experimentKindList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['EXPERIMENTKIND']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['EXPERIMENTKIND'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-20"
        :name="`Sample ${sampleIndex + 1} Energy`"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD|numeric` : ''"
        :vid="`sample ${sampleIndex + 1} energy`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :disabled="inputValue[sampleIndex]['EXPERIMENTKIND'] !== 'SAD' || !allowUDC"
          inputClass="tw-w-full tw-h-8"
          type="number"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['ENERGY']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['ENERGY'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} UDC Anomalous Scatterer`"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} experiment kind,SAD` : ''"
        :vid="`sample ${sampleIndex + 1} UDC anomalous scatterer`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="anomalousOptionsList"
          :is-disabled="!allowUDC"
          optionValueKey="value"
          inputClass="tw-w-full tw-h-8"
          optionTextKey="text"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['ANOMALOUSSCATTERER']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['ANOMALOUSSCATTERER'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :name="`Sample ${sampleIndex + 1} Screening Method`"
        :vid="`sample ${sampleIndex + 1} screening method`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :is-disabled="!allowUDC"
          :options="screeningMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['SCREENINGMETHOD']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['SCREENINGMETHOD'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ?  `required_if:sample ${sampleIndex + 1} screening method,none` : ''"
        :name="`Sample ${sampleIndex + 1} Required Resolution`"
        :vid="`sample ${sampleIndex + 1} required resolution`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :disabled="inputValue[sampleIndex]['SCREENINGMETHOD'] !== 'none' || !allowUDC"
          type="number"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['REQUIREDRESOLUTION']"
          :quiet="true"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['REQUIREDRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} Minimum Resolution`"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ?  `required_if:sample ${sampleIndex + 1} screening method,all` : ''"
        :vid="`sample ${sampleIndex + 1} minimum resolution`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :disabled="inputValue[sampleIndex]['SCREENINGMETHOD'] !== 'all' || !allowUDC"
          type="number"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :quiet="true"
          v-model="inputValue[sampleIndex]['MINIMUMRESOLUTION']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['MINIMUMRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        :name="`Sample ${sampleIndex + 1} No to Collect`"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? `required_if:sample ${sampleIndex + 1} screening method,best`: ''"
        :vid="`sample ${sampleIndex + 1} no to collect`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :disabled="inputValue[sampleIndex]['SCREENINGMETHOD'] !== 'best' || !allowUDC"
          type="number"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['NOTOCOLLECT']"
          :quiet="true"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['NOTOCOLLECT'] }}</p>
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
    currentTab: {
      type: String,
      default: 'basic'
    },
    proteinAcronymList: {
      type: Array,
      default: () => ([])
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
