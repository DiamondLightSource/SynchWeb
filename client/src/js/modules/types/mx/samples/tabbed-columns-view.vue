<template>
  <div>
    <div v-if="currentTab === 'basic'" class="tw-flex tw-w-full">
      <validation-provider tag="div" class="tw-px-3 tw-w-1/4" v-if="currentTab === 'basic'">
        <base-input-select
          :options="anomalousOptionsList"
          inputClass="tw-w-full"
          optionValueKey="value"
          optionTextKey="text"
          v-on="$listeners"
        >
        </base-input-select>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-1/2" v-if="currentTab === 'basic'">
        <base-input-text
          inputClass="tw-w-full"
          v-on="$listeners"
        ></base-input-text>
      </validation-provider>
    </div>

    <div v-else-if="currentTab === 'extraFields'" class="tw-flex tw-w-full">
      <validation-provider tag="div" class="tw-px-3 tw-w-3/12" v-if="currentTab === 'extraFields'">
        <base-input-text
          inputClass="tw-w-full"
          v-on="$listeners"
        ></base-input-text>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-3/12" v-if="currentTab === 'extraFields'">
        <base-input-select
          :options="spaceGroupList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full"
          v-on="$listeners"
        >
        </base-input-select>
      </validation-provider>


      <div class="tw-flex tw-items-center tw-px-3 tw-w-4/12 tw-flex-col" v-if="currentTab === 'extraFields'">
        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider tag="div" class="tw-pb-1 tw-px-1" v-if="currentTab === 'extraFields'">
            <base-input-text
              placeholderText="A"
              v-on="$listeners"
              inputClass="tw-w-12"
            ></base-input-text>
          </validation-provider>
          <validation-provider tag="div" class="tw-pb-1 tw-px-1" v-if="currentTab === 'extraFields'">
            <base-input-text
            placeholderText="B"
              v-on="$listeners"
              inputClass="tw-w-12"
            ></base-input-text>
          </validation-provider>
          <validation-provider tag="div" class="tw-pb-1 tw-px-1" v-if="currentTab === 'extraFields'">
            <base-input-text
              placeholderText="C"
              v-on="$listeners"
              inputClass="tw-w-12"
            ></base-input-text>
          </validation-provider>
        </div>
        <div class="tw-flex tw-w-full tw-justify-center">
          <validation-provider tag="div" class="tw-pb-1 tw-px-1" v-if="currentTab === 'extraFields'">
            <base-input-text
              placeholderText="α"
              v-on="$listeners"
              inputClass="tw-w-12"
            ></base-input-text>
          </validation-provider>
          <validation-provider tag="div" class="tw-pb-1 tw-px-1" v-if="currentTab === 'extraFields'">
            <base-input-text
              placeholderText="β"
              v-on="$listeners"
              inputClass="tw-w-12"
            ></base-input-text>
          </validation-provider>
          <validation-provider tag="div" class="tw-pb-1 tw-px-1" v-if="currentTab === 'extraFields'">
            <base-input-text
              placeholderText="γ"
              v-on="$listeners"
              inputClass="tw-w-12"
            ></base-input-text>
          </validation-provider>
        </div>
        </div>
    </div>


    <div v-else-if="currentTab === 'unattended'" class="tw-w-full tw-flex">
      <validation-provider tag="div" class="tw-px-3 tw-w-2/12" v-if="currentTab === 'unattended'">
        <base-input-select
          :options="centeringMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full"
          v-on="$listeners"
        >
        </base-input-select>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-2/12" v-if="currentTab === 'unattended'">
        <base-input-select
          :options="experimentKindList"
          inputClass="tw-w-full"
          optionValueKey="value"
          optionTextKey="text"
          v-on="$listeners"
        >
        </base-input-select>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-1/12" v-if="currentTab === 'unattended'">
        <base-input-text
          v-on="$listeners"
          inputClass="tw-w-full"
        ></base-input-text>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-2/12" v-if="currentTab === 'unattended'">
        <base-input-select
          :options="anomalousOptionsList"
          optionValueKey="value"
          inputClass="tw-w-full"
          optionTextKey="text"
          v-on="$listeners"
        >
        </base-input-select>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-2/12" v-if="currentTab === 'unattended'">
        <base-input-select
          :options="screeningMethodList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full"
          v-on="$listeners"
        >
        </base-input-select>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-1/12" v-if="currentTab === 'unattended'">
        <base-input-text
          :disabled="selectedScreeningMode.value !== 'None'"
          v-on="$listeners"
          inputClass="tw-w-full"
        ></base-input-text>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-1/12" v-if="currentTab === 'unattended'">
        <base-input-text
          :disabled="selectedScreeningMode.value !== 'Better Than'"
          v-on="$listeners"
          inputClass="tw-w-full"
        ></base-input-text>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-w-1/12" v-if="currentTab === 'unattended'">
        <base-input-text
          :disabled="selectedScreeningMode.value !== 'Collect Best N'"
          v-on="$listeners"
          inputClass="tw-w-full"
        ></base-input-text>
      </validation-provider>
    </div>
  </div>
</template>

<script>
import { ValidationObserver, ValidationProvider }  from 'vee-validate'
import BaseSelectInput from 'app/components/base-input-select.vue'
import BaseTextInput from 'app/components/base-input-text.vue'

// Select List Imports
import ExperimentKindsList from 'utils/experimentkinds.js'

export default {
  name: 'tabbed-columns',
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
      return this.$anomalousList.map(item => ({ value: item, text: item }))
    },
    spaceGroupList() {
      return this.$spaceGroups.map(item => ({ value: item, text: item }))
    },
    centeringMethodList() {
      return this.$centeringMethods.reduce((acc, curr) => {
        if (curr) acc.push({ value: curr, text: curr })

        return acc
      }, [{ value: 'xray', text: 'X-Ray'}])
    },
    experimentKindList() {
      return this.$experimentKindList
    }
  },
  inject: [
    '$spaceGroups',
    '$centeringMethods',
    '$anomalousList',
    '$experimentKindList'
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
  width: 80px;
}
.comment-column, .cell-column {
  width: 200px;
}
.space-group-column, .centering-method-column, .experiment-kind-column {
  width: 100px;
}
.energy-column {
  width: 50px;
}
.resolution-column, .collect-column {
  width: 40px;
  word-wrap: break-word;
}
.screening-method-column {
  width: 100px;
  word-wrap: break-word;
}
</style>