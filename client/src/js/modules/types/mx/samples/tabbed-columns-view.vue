<template>
  <div>
    <div v-show="currentTab === 'basic'" class="tw-flex tw-w-full tw-items-center">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        name="Anomalous Scaterrer"
        :vid="`anomalous-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="anomalousOptionsList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :errorMessage="errors[0]"
          v-model="inputValue[sampleIndex]['ANOMALOUSSCATTERER']"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else class="tw-text-center">{{ selectDataValue(anomalousOptionsList, inputValue, 'ANOMALOUSSCATTERER') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        name="Barcode">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          v-model="inputValue[sampleIndex]['BARCODE']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['BARCODE'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-1/2"
        name="Comment">
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
        name="User Path"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`user-path-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          v-model="inputValue[sampleIndex]['USERPATH']"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['USERPATH'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-3/12"
        name="Space Group"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`spacegroup-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="spaceGroupList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          v-model="inputValue[sampleIndex]['SPACEGROUP']"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else class="tw-text-center">{{ selectDataValue(spaceGroupList, inputValue, 'SPACEGROUP') }}</p>
      </validation-provider>


      <div class="tw-flex tw-items-center tw-px-3 tw-w-4/12 tw-flex-col">
        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-2"
            name="CELL A"
            :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-a-${sampleIndex}`"
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
            name="CELL B"
            :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-b-${sampleIndex}`"
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
            name="CELL C"
            :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-c-${sampleIndex}`"
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
            name="CELL ALPHA"
            :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-d-${sampleIndex}`"
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
            name="CELL BETA"
            :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-e-${sampleIndex}`"
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
            name="CELL GAMMA"
            :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-e-${sampleIndex}`"
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
        name="Centering Method"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`centering-method-${sampleIndex}`"
        v-slot="{ errors }"
        >
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="centeringMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['CENTRINGMETHOD']"
        />
        <p v-else class="tw-text-center">{{ selectDataValue(spaceGroupList, inputValue, 'CENTRINGMETHOD') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-32"
        name="Experiment Kind"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`experiment-kind-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="experimentKindList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['EXPERIMENTTYPEID']"
        />
        <p v-else class="tw-text-center">{{ selectDataValue(spaceGroupList, inputValue, 'EXPERIMENTTYPEID') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-20"
        name="Energy"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['EXPERIMENTTYPEID'] === 'phasing' ? 'required|numeric' : ''"
        :vid="`energy-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['ENERGY']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['ENERGY'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        name="UDC Anomalous Scatterer"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['EXPERIMENTKIND'] === 'phasing' ? 'required' : ''"
        :vid="`anomalous-scatterer-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="anomalousOptionsList"
          optionValueKey="value"
          inputClass="tw-w-full tw-h-8"
          optionTextKey="text"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['ANOMALOUSSCATTERER']"
        />
        <p v-else class="tw-text-center">{{ selectDataValue(spaceGroupList, inputValue, 'ANOMALOUSSCATTERER') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        name="Screening Method"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`screening-method-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :options="screeningMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['SCREENINGMETHOD']"
        />
        <p v-else class="tw-text-center">{{ selectDataValue(spaceGroupList, inputValue, 'SCREENINGMETHOD') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        name="Required Resolution"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['SCREENINGMETHOD'] === 'None' ? 'required' : ''"
        :vid="`required-resolution-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :disabled="inputValue[sampleIndex]['SCREENINGMETHOD'] !== 'None'"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['REQUIREDRESOLUTION']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['REQUIREDRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        name="Minimum Resolution"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['SCREENINGMETHOD'] === 'Better Than' ? 'required' : ''"
        :vid="`minimum-resolution-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :disabled="inputValue[sampleIndex]['SCREENINGMETHOD'] !== 'Better Than'"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['MINIMUMRESOLUTION']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['MINIMUMRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-24"
        name="No to Collect"
        :rules="
          inputValue[sampleIndex]['PROTEINID'] > -1 &&
          inputValue[sampleIndex]['SCREENINGMETHOD'] === 'Collect Best N' &&
          checkSampleInSampleGroups(inputValue[sampleIndex]['PROTEINID']) ? 'required' : ''"
        :vid="`no-to-collect-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="canEditRow(inputValue[sampleIndex]['LOCATION'])"
          :disabled="inputValue[sampleIndex]['SCREENINGMETHOD'] !== 'Collect Best N'"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['NOTOCOLLECT']"
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

export default {
  name: 'tabbed-columns',
  mixins: [MxSampleTableMixin],
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
