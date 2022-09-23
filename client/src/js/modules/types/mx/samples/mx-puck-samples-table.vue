<template>
  <div class="tw-mt-12 tw-mb-4">
    <div
      v-if="!containerId"
      class="tw-flex tw-justify-end tw-mb-2"
    >
      <button
        class="button tw-mr-1"
        @click="$emit('clone-container', 0)"
      >
        Clone all from first row
      </button>
      <button
        class="button tw-ml-1"
        @click="$emit('clear-container')"
      >
        Clear all samples
      </button>
    </div>
    <div
      v-if="containerId && !isContainerProcessing && !dataCollectionStarted"
      class="tw-w-full tw-flex tw-flex-col tw-items-end"
    >
      <p class="tw-w-full tw-mb-2">
        Select a field and enter a value to bulk populate in all samples
      </p>
      <div class="tw-flex tw-w-full tw-mb-2">
        <base-input-select
          option-text-key="title"
          option-value-key="key"
          :options="mappedEditableColumns"
          :value="selectedEditableColumn.key"
          outer-class="tw-mr-2"
          input-class="tw-h-8"
          @input="resetSelectedEditableColumn"
        />
        <component
          :is="selectedEditableColumn.componentType"
          v-model="selectedFieldValue"
          :options="selectedEditableColumn.data"
          input-class="tw-h-8"
          outer-class="tw-mx-2 tw-h-full"
          option-text-key="text"
          option-value-key="value"
        />
        <button
          name="submit"
          type="submit"
          :class="['button submit tw-mx-2 tw-text-base tw-px-4 tw-py-1 tw-h-8', invalid ? 'tw-border tw-border-red-500 tw-bg-red-500': '']"
          @click.prevent="onUpdateSamples"
        >
          Update Samples
        </button>
      </div>
      <p class="tw-w-full tw-mb-2">
        Click on the button to save changes
      </p>
    </div>
    <div class="tw-flex tw-justify-end tw-w-full tw-h-auto tw-items-center">
      <a
        v-for="(tabName, tabNameIndex) in tabNames"
        :key="tabNameIndex"
        :class="{
          'tw-border-t': true,
          'tw-border-l': true,
          'tw-cursor-pointer': true,
          'tw-border-r': tabNameIndex === tabNames.length - 1,
          'tw-bg-table-header-background': currentTab === tabName.key,
          'tw-text-table-header-color': currentTab === tabName.key,
          'tw-p-2': currentTab !== tabName.key,
          'tw-p-3': currentTab === tabName.key,
        }"
        @click="switchTabColumn(tabName.key)"
      >
        {{ tabName.name }}
      </a>
    </div>
    <div class="list-header tw-flex tw-items-center tw-w-full tw-bg-table-header-background tw-text-table-header-color">
      <div
        v-for="(column, columnIndex) in requiredColumns"
        :key="columnIndex"
        :class="{
          'tw-flex': true,
          'tw-items-center': true,
          'tw-py-1': true,
          'tw-justify-center': true,
          'tw-text-center': true,
          [column.className]: true
        }"
      >
        {{ column.title }}
      </div>
      <div class="tw-flex tw-w-1/2 tw-border-table-header-color tw-border-l">
        <div
          v-for="(column, columnIndex) in dynamicColumns"
          :key="columnIndex"
          :class="{
            'tw-flex': true,
            'tw-items-center': true,
            'tw-py-1': true,
            'tw-justify-center': true,
            'tw-text-center': true,
            [column.className]: true
          }"
        >
          {{ column.title }}
        </div>
      </div>
    </div>
    <sample-table-row
      v-for="(sample, sampleIndex) in samples"
      :ref="`sample-row-${sampleIndex}`"
      :key="sampleIndex"
      :basic-columns="basicColumns"
      :extra-fields-columns="extraFieldsColumns"
      :required-columns="requiredColumns"
      :current-tab="currentTab"
      :sample="sample"
      :sample-index="sampleIndex"
      :udc-columns="udcColumns"
      :proteins="proteins"
      :samples-length="samples.length"
      :container-id="containerId"
      v-on="$listeners"
    />
    <portal to="dialog">
      <custom-dialog-box
        v-if="displaySampleGroupModal"
        size="small"
        :hide-ok-button="true"
        @perform-modal-action="performModalAction"
        @close-modal-action="closeModalAction"
      >
        <template>
          <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
            <p>Sample Groups</p>
            <button
              class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
              @click="closeModalAction"
            >
              <i class="fa fa-times" />
            </button>
          </div>
          <div class="tw-py-3 tw-px-4">
            <base-input-select
              class="tw-py-5"
              option-text-key="text"
              option-value-key="value"
              :options="shipments"
              input-class="tw-w-full tw-h-6"
              :value="containerSamplesGroupData['shipmentId']"
              label="Shipment:"
              outer-class="tw-w-full tw-flex"
              label-class="tw-w-3/5 tw-font-bold"
              @input="onSampleGroupDataChange($event, 'shipmentId')"
            />

            <base-input-select
              class="tw-py-5"
              option-text-key="text"
              option-value-key="value"
              :options="dewars"
              input-class="tw-w-full tw-h-6"
              :value="containerSamplesGroupData['dewarId']"
              label="Dewars:"
              outer-class="tw-w-full tw-flex"
              label-class="tw-w-3/5 tw-font-bold"
              @input="onSampleGroupDataChange($event, 'dewarId')"
            />

            <base-input-select
              class="tw-py-5"
              option-text-key="text"
              option-value-key="value"
              :options="containers"
              input-class="tw-w-full tw-h-6"
              :value="containerSamplesGroupData['containerId']"
              label="Containers:"
              outer-class="tw-w-full tw-flex"
              label-class="tw-w-3/5 tw-font-bold"
              @input="onSampleGroupDataChange($event, 'containerId')"
            />

            <div class="tw-w-full tw-flex tw-justify-end tw-py-4">
              <button
                class="button"
                @click="createNewSampleGroup"
              >
                <span class="fa fa-plus" /> &nbsp; Create Group
              </button>
            </div>
          </div>
        </template>
      </custom-dialog-box>
    </portal>
  </div>
</template>

<script>
import SampleTableRow from 'modules/types/mx/samples/sample-table-row.vue'
import CustomDialogBox from 'js/app/components/custom-dialog-box.vue'
import { mapGetters } from 'vuex'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import { sortBy, uniqBy, debounce } from 'lodash'
import sampleTableMixin from "modules/types/mx/samples/sample-table-mixin";

export default {
  name: 'MxPuckSamplesTable',
  components: {
    'custom-dialog-box': CustomDialogBox,
    'sample-table-row': SampleTableRow,
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText
  },
  mixins: [sampleTableMixin],
  props: {
    currentlyEditingRow: {
      type: Number,
      default: -1
    },
    proteins: {
      type: Array,
      default: () => ([])
    },
    containerId: {
      type: [Number, String, undefined]
    },
    invalid: {
      type: Boolean
    }
  },
  data() {
    return {
      requiredColumns: [
        {
          key: 'LOCATION',
          title: 'Loc',
          className: 'location-column'
        },
        {
          key: 'ACRONYM',
          title: 'Protein Acronym',
          className: 'protein-column'
        },
        {
          key: 'NAME',
          title: 'Name',
          className: 'name-column'
        },
        {
          key: 'SAMPLEGROUP',
          title: 'Sample Group',
          className: 'sample-group-column'
        }
      ],
      currentTab: 'basic',
      displaySampleGroupModal: false,
      selectedFieldValue: '',
      selectedEditableColumn: {
        key: '',
        title: '',
        className: '',
        componentType: 'base-input-text',
        data: '',
        inputType: 'text'
      },
      updateSamplesFieldWithData: debounce(searchText => this.updateSelectedFieldValue(searchText), 1000)
    }
  },
  computed: {
    tableColumns() {
      const columnsMap = {
        basic: this.basicColumns,
        extraFields: this.extraFieldsColumns,
        unattended: this.udcColumns
      }

      return [...this.requiredColumns, ...columnsMap[this.currentTab]]
    },
    ...mapGetters({ samples: 'samples/samples' }),
    basicColumns() {
      return [
        {
          key: 'ANOMALOUSSCATTERER',
          title: 'Anomalous',
          className: 'tw-w-32',
          componentType: 'base-input-select',
          data: this.anomalousOptionsList,
          inputType: 'select'
        },
        {
          key: 'CODE',
          title: 'Barcode',
          className: 'tw-w-32',
          componentType: 'base-input-text',
          data: '',
          inputType: 'text'
        },
        {
          key: 'COMMENTS',
          title: 'Comment',
          className: 'tw-w-1/4',
          componentType: 'base-input-text',
          data: '',
          inputType: 'text'
        },
        {
          key: 'STATUS',
          title: 'Status',
          className: 'tw-w-1/4',
          componentType: 'base-input-text',
          data: '',
          inputType: 'text'
        }
      ]
    },
    extraFieldsColumns() {
      return [
        {
          key: 'USERPATH',
          title: 'User Path',
          className: 'tw-w-3/12',
          componentType: 'base-input-text',
          data: '',
          inputType: 'text'
        },
        {
          key: 'SPACEGROUP',
          title: 'Spacegroup',
          className: 'tw-w-3/12',
          componentType: 'base-input-select',
          data: this.spaceGroupList,
          inputType: 'select'
        },
        {
          key: 'CELLS',
          title: 'Unit Cell',
          className: 'tw-w-4/12',
          componentType: 'base-input-text',
          data: '',
          inputType: 'number'
        }
      ]
    },
    udcColumns() {
      return [
        {
          key: 'CENTRINGMETHOD',
          title: 'Centring Method',
          className: 'tw-w-24',
          componentType: 'base-input-select',
          data: this.centringMethodList,
          inputType: 'select'
        },
        {
          key: 'EXPERIMENTKIND',
          title: 'Experiment Kind',
          className: 'tw-w-32',
          componentType: 'base-input-select',
          data: this.experimentKindList,
          inputType: 'select'
        },
        {
          key: 'ENERGY',
          title: 'Energy (eV)',
          className: 'tw-w-20',
          componentType: 'base-input-text',
          data: '',
          inputType: 'number'
        },
        {
          key: 'ANOMALOUSSCATTERER',
          title: 'Anomalous',
          className: 'tw-w-24',
          componentType: 'base-input-select',
          data: this.anomalousOptionsList,
          inputType: 'select'
        },
        {
          key: 'SCREENINGMETHOD',
          title: 'Screening Method',
          className: 'tw-w-24',
          componentType: 'base-input-select',
          data: this.screeningMethodList,
          inputType: 'select'
        },
        {
          key: 'REQUIREDRESOLUTION',
          title: 'Required Resolution',
          className: 'tw-w-24',
          componentType: 'base-input-text',
          data: '',
          inputType: 'number'
        },
        {
          key: 'MINIMUMRESOLUTION',
          title: 'Minimum Resolution',
          className: 'tw-w-24',
          componentType: 'base-input-text',
          data: '',
          inputType: 'number'
        },
        {
          key: 'SCREENINGCOLLECTVALUE',
          title: 'Number to collect',
          className: 'tw-w-24',
          componentType: 'base-input-text',
          data: '',
          inputType: 'number'
        }
      ]
    },
    dynamicColumns() {
      const columnsMap = {
        basic: this.basicColumns,
        extraFields: this.extraFieldsColumns,
        unattended: this.udcColumns
      }

      return columnsMap[this.currentTab]
    },
    tabNames() {
      return [
        { key: 'basic', name: 'Basic' },
        { key: 'extraFields', name: 'Extra Fields' },
        { key: 'unattended', name: 'Unattended (UDC)' }
      ]
    },
    containerSamplesGroupData: {
      get() {
        return this.$store.getters['samples/getContainerSamplesGroupData']
      },
      set(data) {
        this.$store.commit('samples/setContainerSampleGroupData', data)
      }
    },
    mappedEditableColumns() {
      const list = [...this.basicColumns, ...this.extraFieldsColumns, ...this.udcColumns].filter(column => !['STATUS', 'CELLS'].includes(column.key))
      list.push({
        title: 'Sample Groups',
        key: 'SAMPLEGROUP',
        className: '',
        componentType: 'base-input-select',
        data: this.sampleGroups,
        inputType: 'select'
      },
      {
        title: 'Cell A',
        key: 'CELL_A',
        className: '',
        componentType: 'base-input-text',
        data: '',
        inputType: 'number'
      },
      {
        title: 'Cell B',
        key: 'CELL_B',
        className: '',
        componentType: 'base-input-text',
        data: '',
        inputType: 'number'
      },
      {
        title: 'Cell C',
        key: 'CELL_C',
        className: '',
        componentType: 'base-input-text',
        data: '',
        inputType: 'number'
      },
      {
        title: 'Cell Alpha',
        key: 'CELL_ALPHA',
        className: '',
        componentType: 'base-input-text',
        data: '',
        inputType: 'number'
      },
      {
        title: 'Cell Beta',
        key: 'CELL_BETA',
        className: '',
        componentType: 'base-input-text',
        data: '',
        inputType: 'number'
      },
      {
        title: 'Cell Gamma',
        key: 'CELL_GAMMA',
        className: '',
        componentType: 'base-input-text',
        data: '',
        inputType: 'number'
      },
      {
        title: '',
        key: '',
        className: '',
        componentType: 'base-input-text',
        data: '',
        inputType: 'text'
      })

      return sortBy(uniqBy(list, 'key'), 'key')
    },
  },
  watch: {
    currentlyEditingRow(newValue) {
      this.editingRow = newValue
    },
    selectedFieldValue: {
      handler: 'updateSamplesFieldWithData',
    }
  },
  methods: {
    switchTabColumn(name) {
      this.currentTab = name
    },
    closeModalAction() {
      this.displaySampleGroupModal = false
      this.editingRow = null
    },
    performModalAction() {
    },
    createNewSampleGroup() {

    },
    async onSampleGroupDataChange(value, property) {
      let changedSampleGroupsData = {}
      switch(property) {
        case 'shipmentId':
          changedSampleGroupsData = {
            shipmentId: value,
            dewarId: null,
            containerId: null
          }
          break
        case 'dewarId':
          changedSampleGroupsData = {
            ...this.containerSamplesGroupData,
            dewarId: value,
            containerId: null
          }
          break
        case 'containerId':
          changedSampleGroupsData = {
            ...this.containerSamplesGroupData,
            containerId: value
          }
          break
        default:
          break
      }
      this.containerSamplesGroupData = changedSampleGroupsData
    },
    resetSelectedEditableColumn(value) {
      this.selectedEditableColumn = this.mappedEditableColumns.find(column => column.key === value)
      this.selectedFieldValue = ''
    },
    updateSelectedFieldValue(newValue) {
      if (this.selectedEditableColumn.key) {
        this.samples.forEach((sample, index) => {
          if (sample['BLSAMPLEID']) {
            const path = `samples/${index}/${this.selectedEditableColumn.key}`
            this.$store.commit('samples/updateSamplesField', { path, value: newValue } )
          }
        })
      }
    },
    onUpdateSamples() {
      this.$emit('bulk-update-samples')
    }
  },
}
</script>
<style scoped>
.location-column {
  width: 30px;
}
.protein-column {
  width: 15%;
}
.name-column {
  width: 10%;
}
.sample-group-column {
  width: 13%;
}
.actions-column {
  width: calc(12% - 30px);
}
.min-height-8 {
  min-height: 32px;
}
</style>