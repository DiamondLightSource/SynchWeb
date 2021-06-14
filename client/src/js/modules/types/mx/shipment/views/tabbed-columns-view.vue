<template>
  <div>
    <div v-if="currentTab === 'basic'" class="tw-flex tw-items-center">
      <base-input-select
        :options="anomalousOptionsList"
        optionValueKey="value"
        optionTextKey="text"
        class="tw-px-3"
        v-on="$listeners"
      >
      </base-input-select>

      <base-input-text
        class="tw-px-3"
        v-on="$listeners"
      ></base-input-text>
    </div>


    <div v-if="currentTab === 'extraFields'" class="tw-flex tw-w-full">
      <base-input-text
        class="tw-px-3"
        v-on="$listeners"
      ></base-input-text>

      <base-input-select
        :options="spaceGroupList"
        optionValueKey="value"
        optionTextKey="text"
        class="tw-px-3"
        v-on="$listeners"
      >
      </base-input-select>

      <div class="tw-flex tw-flex-wrap tw-px-3">
        <base-input-text
          placeholderText="A"
          class="tw-px-1"
          v-on="$listeners"
        ></base-input-text>

        <base-input-text
          placeholderText="B"
          class="tw-px-1"
          v-on="$listeners"
        ></base-input-text>

        <base-input-text
          placeholderText="C"
          class="tw-px-1"
          v-on="$listeners"
        ></base-input-text>

        <base-input-text
          placeholderText="α"
          class="tw-px-1"
          v-on="$listeners"
        ></base-input-text>

        <base-input-text
          placeholderText="β"
          class="tw-px-1"
          v-on="$listeners"
        ></base-input-text>
        
        <base-input-text
          placeholderText="γ"
          class="tw-px-1"
          v-on="$listeners"
        ></base-input-text>
      </div>
    </div>


    <div v-if="currentTab === 'unattended'" class="tw-flex tw-w-full">
      <base-input-select
        class="tw-px-3"
        :options="centeringMethodList"
        optionValueKey="value"
        optionTextKey="text"
        v-on="$listeners"
      >
      </base-input-select>

      <base-input-select
        class="tw-px-3"
        :options="experimentKindList"
        optionValueKey="value"
        optionTextKey="text"
        v-on="$listeners"
      >
      </base-input-select>

      <base-input-text
        class="tw-px-3"
        v-on="$listeners"
      ></base-input-text>

      <base-input-select
        class="tw-px-3"
        :options="anomalousOptionsList"
        optionValueKey="value"
        optionTextKey="text"
        v-on="$listeners"
      >
      </base-input-select>

      <base-input-select
        class="tw-px-3"
        :options="screeningMethodList"
        optionValueKey="value"
        optionTextKey="text"
        v-on="$listeners"
      >
      </base-input-select>

      <base-input-text
        class="tw-px-3"
        :disabled="selectedScreeningMode.value !== 'None'"
        v-on="$listeners"
      ></base-input-text>

      <base-input-text
        class="tw-px-3"
        :disabled="selectedScreeningMode.value !== 'Better Than'"
        v-on="$listeners"
      ></base-input-text>

      <base-input-text
        class="tw-px-3"
        :disabled="selectedScreeningMode.value !== 'Collect Best N'"
        v-on="$listeners"
      ></base-input-text>
    </div>
  </div>
</template>

<script>
import BaseSelectInput from '/app/components/base-input-select.vue'
import BaseTextInput from '/app/components/base-input-text.vue'

// Select List Imports
import AnomalousList from '/utils/anoms.js'
import SpaceGroupList from '/utils/sgs.js'
import ExperimentKindsList from '/utils/experimentkinds.js'
import CenteringMethodList from '/utils/centeringmethods.js'

export default {
  name: 'tabbed-columns',
  components: {
    'base-input-select': BaseSelectInput,
    'base-input-text': BaseTextInput
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
      return SpaceGroupList.list.map(item => ({ value: item, text: item }))
    },
    centeringMethodList() {
      return CenteringMethodList.list.reduce((acc, curr) => {
        if (curr) acc.push({ value: item, text: item })

        return acc
      }, [{ value: 'xray', text: 'X-Ray'}])
    },
    experimentKindList() {
      return ExperimentKindsList.list.map(item => ({ vaue: item, text: item }))
    }
  },
}
</script>

<style>

</style>