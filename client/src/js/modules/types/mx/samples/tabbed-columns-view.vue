<template>
  <div>
    <div v-show="currentTab === 'basic'" class="tw-flex tw-w-full">
      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-1/4"
        :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
        name="Anomalous Scaterrer"
        :vid="`anomalous-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(rowData)"
          :options="anomalousOptionsList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :errorMessage="errors[0]"
          :value="rowData['ANOMALOUSSCATTERER']"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'ANOMALOUSSCATTERER',
            value: $event
          })"
        />
        <p v-else>{{ selectDataValue(anomalousOptionsList, rowData, 'ANOMALOUSSCATTERER') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-1/2"
        name="Comment">
        <base-input-text
          v-if="displayInputForm(rowData)"
          inputClass="tw-w-full tw-h-8"
          :value="rowData['COMMENTS']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'COMMENTS',
            value: $event
          })"
        />
        <p v-else>{{ rowData['COMMENTS'] }}</p>
      </validation-provider>
    </div>

    <div v-show="currentTab === 'extraFields'" class="tw-flex tw-w-full">
      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-3/12"
        name="User Path"
        :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`user-path-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(rowData)"
          inputClass="tw-w-full tw-h-8"
          :value="rowData['USERPATH']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'USERPATH',
            value: $event
          })"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else>{{ rowData['USERPATH'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-3/12"
        name="Space Group"
        :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`spacegroup-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(rowData)"
          :options="spaceGroupList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :value="rowData['SPACEGROUP']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'SPACEGROUP',
            value: $event
          })"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else>{{ selectDataValue(spaceGroupList, rowData, 'SPACEGROUP') }}</p>
      </validation-provider>


      <div class="tw-flex tw-items-center tw-px-3 tw-w-4/12 tw-flex-col">
        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-1"
            name="CELL A"
            :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-a-${sampleIndex}`"
            v-slot="{ errors }">
            <base-input-text
              v-if="displayInputForm(rowData)"
              placeholderText="A"
              :quiet="true"
              v-on="$listeners"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              :value="rowData['CELL_A']"
              @input="$emit('input', {
                index: sampleIndex,
                key: 'CELL_A',
                value: $event
              })"
            />
            <p v-else>{{ rowData['CELL_A'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-1"
            name="CELL B"
            :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-b-${sampleIndex}`"
            v-slot="{ errors }">
            <base-input-text
              v-if="displayInputForm(rowData)"
              placeholderText="B"
              v-on="$listeners"
              :quiet="true"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              :value="rowData['CELL_B']"
              @input="$emit('input', {
                index: sampleIndex,
                key: 'CELL_B',
                value: $event
              })"
            />
            <p v-else>{{ rowData['CELL_B'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-1"
            name="CELL C"
            :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-c-${sampleIndex}`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="displayInputForm(rowData)"
              placeholderText="C"
              v-on="$listeners"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :quiet="true"
              :errorClass="errors[0] ? 'ferror' : ''"
              :value="rowData['CELL_C']"
              @input="$emit('input', {
                index: sampleIndex,
                key: 'CELL_C',
                value: $event
              })"
            />
            <p v-else>{{ rowData['CELL_C'] }}</p>
          </validation-provider>
        </div>


        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-1"
            name="CELL ALPHA"
            :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-d-${sampleIndex}`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="displayInputForm(rowData)"
              placeholderText="α"
              v-on="$listeners"
              inputClass="tw-w-12 tw-h-8"
              :quiet="true"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              :value="rowData['CELL_ALPHA']"
              @input="$emit('input', {
                index: sampleIndex,
                key: 'CELL_ALPHA',
                value: $event
              })"
            />
            <p v-else>{{ rowData['CELL_ALPHA'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-1"
            name="CELL BETA"
            :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-e-${sampleIndex}`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="displayInputForm(rowData)"
              placeholderText="β"
              v-on="$listeners"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :value="rowData['CELL_BETA']"
              :errorClass="errors[0] ? 'ferror' : ''"
              :quiet="true"
              @input="$emit('input', {
                index: sampleIndex,
                key: 'CELL_BETA',
                value: $event
              })"
            />
            <p v-else>{{ rowData['CELL_BETA'] }}</p>
          </validation-provider>

          <validation-provider
            tag="div"
            class="tw-pb-1 tw-px-1"
            name="CELL GAMMA"
            :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
            :vid="`cell-e-${sampleIndex}`"
            v-slot="{ errors }"
            >
            <base-input-text
              v-if="displayInputForm(rowData)"
              placeholderText="γ"
              v-on="$listeners"
              inputClass="tw-w-12 tw-h-8"
              :errorMessage="errors[0]"
              :errorClass="errors[0] ? 'ferror' : ''"
              :value="rowData['CELL_GAMMA']"
              :quiet="true"
              @input="$emit('input', {
                index: sampleIndex,
                key: 'CELL_GAMMA',
                value: $event
              })"
            />
            <p v-else>{{ rowData['CELL_GAMMA'] }}</p>
          </validation-provider>
        </div>
      </div>
    </div>


    <div v-show="currentTab === 'unattended' && showUDCColumns" class="tw-w-full tw-flex">
      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-2/12"
        name="Centering Method"
        :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`centering-method-${sampleIndex}`"
        v-slot="{ errors }"
        >
        <base-input-select
          v-if="displayInputForm(rowData)"
          :options="centeringMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="rowData['CENTERINGMETHOD']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'CENTERINGMETHOD',
            value: $event
          })"
        />
        <p v-else>{{ selectDataValue(spaceGroupList, rowData, 'CENTERINGMETHOD') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-2/12"
        name="Experiment Kind"
        :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`experiment-kind-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(rowData)"
          :options="experimentKindList"
          inputClass="tw-w-full tw-h-8"
          optionValueKey="value"
          optionTextKey="text"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="rowData['EXPERIMENTKIND']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'EXPERIMENTKIND',
            value: $event
          })"
        />
        <p v-else>{{ selectDataValue(spaceGroupList, rowData, 'EXPERIMENTKIND') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-1/12"
        name="Energy"
        :rules="rowData['PROTEINID'] > -1 && rowData['EXPERIMENTKIND'] === 'phasing' ? 'required|numeric' : ''"
        :vid="`energy-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(rowData)"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="rowData['ENERGY']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'ENERGY',
            value: $event
          })"
        />
        <p v-else>{{ rowData['ENERGY'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-2/12"
        name="UDC Anomalous Scatterer"
        :rules="rowData['PROTEINID'] > -1 && rowData['EXPERIMENTKIND'] === 'phasing' ? 'required' : ''"
        :vid="`anomalous-scatterer-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(rowData)"
          :options="anomalousOptionsList"
          optionValueKey="value"
          inputClass="tw-w-full tw-h-8"
          optionTextKey="text"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="rowData['ANOMALOUSSCATTERER']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'ANOMALOUSSCATTERER',
            value: $event
          })"
        />
        <p v-else>{{ selectDataValue(spaceGroupList, rowData, 'ANOMALOUSSCATTERER') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-2/12"
        name="Screening Method"
        :rules="rowData['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`screening-method-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(rowData)"
          :options="screeningMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          v-on="$listeners"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="rowData['SCREENINGMETHOD']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'SCREENINGMETHOD',
            value: $event
          })"
        />
        <p v-else>{{ selectDataValue(spaceGroupList, rowData, 'SCREENINGMETHOD') }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-1/12"
        name="Required Resolution"
        :rules="rowData['PROTEINID'] > -1 && rowData['SCREENINGMETHOD'] === 'None' ? 'required' : ''"
        :vid="`required-resolution-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(rowData)"
          :disabled="selectedScreeningMode.value !== 'None'"
          v-on="$listeners"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="rowData['SCREENINGMETHOD']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'SCREENINGMETHOD',
            value: $event
          })"
        />
        <p v-else>{{ rowData['SCREENINGMETHOD'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-1/12"
        name="Minimum Resolution"
        :rules="rowData['PROTEINID'] > -1 && rowData['SCREENINGMETHOD'] === 'Better Than' ? 'required' : ''"
        :vid="`minimum-resolution-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(rowData)"
          :disabled="selectedScreeningMode.value !== 'Better Than'"
          v-on="$listeners"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="rowData['MINIMUMRESOLUTION']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'MINIMUMRESOLUTION',
            value: $event
          })"
        />
        <p v-else>{{ rowData['MINIMUMRESOLUTION'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-w-1/12"
        name="No to Collect"
        :rules="rowData['PROTEINID'] > -1 && rowData['SCREENINGMETHOD'] === 'Collect Best N' ? 'required' : ''"
        :vid="`no-to-collect-${sampleIndex}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(rowData)"
          :disabled="selectedScreeningMode.value !== 'Collect Best N'"
          v-on="$listeners"
          inputClass="tw-w-full tw-h-8"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="rowData['NOTOCOLLECT']"
          @input="$emit('input', {
            index: sampleIndex,
            key: 'NOTOCOLLECT',
            value: $event
          })"
        />
        <p v-else>{{ rowData['NOTOCOLLECT'] }}</p>
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
    rowData: {
      type: Object,
      default: () => ({})
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
    return {
      screeningMethodList: [
        {
          value: 'None',
          text: 'None'
        },
        {
          value: 'Better Than',
          text: 'Better Than'
        },
        {
          value: 'Collect Best N',
          text: 'Collect Best N'
        }
      ],
      rowData: []
    }
  },
  methods: {},
  computed: {
    anomalousOptionsList() {
      return AnomalousList.list.map(item => ({ value: item, text: item }))
    },
    spaceGroupList() {
      return spaceGroup.list.map(item => ({ value: item, text: item }))
    },
    centeringMethodList() {
      return CenteringMethodList.list.reduce((acc, curr) => {
        if (curr) acc.push({ value: item, text: item })

        return acc
      }, [{ value: 'xray', text: 'X-Ray'}])
    },
    experimentKindList() {
      return this.$experimentKindList
    },
    showUDCColumns() {
      return this.$showUDCColumns()
    }
  },
  inject: [
    '$spaceGroups',
    '$centeringMethods',
    '$anomalousList',
    '$experimentKindList',
    '$showUDCColumns'
  ]
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
