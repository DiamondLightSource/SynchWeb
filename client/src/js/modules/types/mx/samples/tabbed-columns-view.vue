<template>
  <div>
    <div v-show="currentTab === 'basic'" class="tw-flex tw-w-full">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-1/4"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        name="Anomalous Scaterrer"
        :vid="`anomalous-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(inputValue)"
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
        class="tw-px-2 tw-w-1/2"
        name="Comment">
        <base-input-text
          v-if="displayInputForm(inputValue)"
          inputClass="tw-w-full tw-h-8"
          v-model="inputValue[sampleIndex]['COMMENTS']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['COMMENTS'] }}</p>
      </validation-provider>
    </div>

    <div v-show="currentTab === 'extraFields'" class="tw-flex tw-w-full">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-3/12"
        name="User Path"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`user-path-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(inputValue)"
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
          v-if="displayInputForm(inputValue)"
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
              v-if="displayInputForm(inputValue)"
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
              v-if="displayInputForm(inputValue)"
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
              v-if="displayInputForm(inputValue)"
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
              v-if="displayInputForm(inputValue)"
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
              v-if="displayInputForm(inputValue)"
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
              v-if="displayInputForm(inputValue)"
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


    <div v-show="currentTab === 'unattended' && showUDCColumns" class="tw-w-full tw-flex">
      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-2/12"
        name="Centering Method"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`centering-method-${sampleIndex}`"
        v-slot="{ errors }"
        >
        <base-input-select
          v-if="displayInputForm(inputValue)"
          :options="centeringMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['CENTERINGMETHOD']"
        />
        <p v-else class="tw-text-center">{{ selectDataValue(spaceGroupList, inputValue, 'CENTERINGMETHOD') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-2/12"
        name="Experiment Kind"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`experiment-kind-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(inputValue)"
          :options="experimentKindList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['EXPERIMENTKIND']"
        />
        <p v-else class="tw-text-center">{{ selectDataValue(spaceGroupList, inputValue, 'EXPERIMENTKIND') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-1/12"
        name="Energy"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['EXPERIMENTKIND'] === 'phasing' ? 'required|numeric' : ''"
        :vid="`energy-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(inputValue)"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['ENERGY']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['ENERGY'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-2/12"
        name="UDC Anomalous Scatterer"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['EXPERIMENTKIND'] === 'phasing' ? 'required' : ''"
        :vid="`anomalous-scatterer-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(inputValue)"
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
        class="tw-px-2 tw-w-2/12"
        name="Screening Method"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`screening-method-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(inputValue)"
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
        class="tw-px-2 tw-w-1/12"
        name="Required Resolution"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['SCREENINGMETHOD'] === 'None' ? 'required' : ''"
        :vid="`required-resolution-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(inputValue)"
          :disabled="selectedScreeningMode.value !== 'None'"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['REQUIREDRESOLUTION']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['REQUIREDRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-1/12"
        name="Minimum Resolution"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['SCREENINGMETHOD'] === 'Better Than' ? 'required' : ''"
        :vid="`minimum-resolution-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(inputValue)"
          :disabled="selectedScreeningMode.value !== 'Better Than'"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleIndex]['MINIMUMRESOLUTION']"
        />
        <p v-else class="tw-text-center">{{ inputValue[sampleIndex]['MINIMUMRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-w-1/12"
        name="No to Collect"
        :rules="inputValue[sampleIndex]['PROTEINID'] > -1 && inputValue[sampleIndex]['SCREENINGMETHOD'] === 'Collect Best N' ? 'required' : ''"
        :vid="`no-to-collect-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(inputValue)"
          :disabled="selectedScreeningMode.value !== 'Collect Best N'"
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
    spaceGroupList: {
      type: Array,
      default: () => ([])
    },
    selectedScreeningMode: {
      type: Object,
      default: () => ({
        value: 'None',
        text: 'None'
      })
    },
    selectedCenteringMode: {
      type: Object,
      default: () => ({
        value: 'XRay',
        text: 'X-Ray'
      })
    },
    experimentKind: {
      type: Array,
      default: () => ([])
    },
    sampleIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {}
  },
  methods: {},
  computed: {
    showUDCColumns() {
      return this.$showUDCColumns()
    }
  },
}
</script>

<style scoped>
.location-column {
  width: 30px;
}
.protein-column {
  width: 20%;
}
.name-column {
  width: 10%;
} 
.sample-group-column {
  width: 10%;
}

.user-path-column, .screening-method-column {
  width: 150px;
}
.anomalous-column {
  width: 100px;
}
.comment-column, .cell-column {
  width: 200px;
}
.space-group-column, .centering-method-column, .experiment-kind-column {
  width: 70px;
}
.energy-column {
  width: 50px;
}
.resolution-column, .collect-column {
  width: 40px;
  word-wrap: break-word;
}
.screening-method-column {
  width: 70px;
  word-wrap: break-word;
}
</style>
