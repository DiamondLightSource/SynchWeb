<template>
  <div>
    <div class="list-header tw-flex tw-items-center">
      <div
        v-for="(column, columnIndex) in tableColumns"
        :key="columnIndex"
        :class="{'tw-border-right': columnIndex === 3 }"
      >
        {{ column.title }}
      </div>
    </div>
    <div class="tw-flex" v-for="(sample, sampleIndex) in samples" :key="sampleIndex">
      <div class="">{{ sample.LOCATION || sampleIndex + 1 }}</div>

      <base-input-select
        :options="anomalousOptionsList"
        optionValueKey="value"
        optionTextKey="text"
        class="tw-px-3"
        @input="handleProteinAcronymSelection(sampleIndex)"
      ></base-input-select>

      <base-input-text></base-input-text>

      <base-input-select
        :options="anomalousOptionsList"
        optionValueKey="value"
        optionTextKey="text"
        class="tw-px-3 tw-border-right"
        @input="handleSampleGroupSelection(sampleIndex)"
      ></base-input-select>

      <tabbed-columns
        :currentTab="currentTab"
        :rowData="sample"
        :selectedScreeningMode="{}"
        :selectedCenteringMode="{}"
        @input="handleFieldChange($event, sampleIndex)"
      >
      </tabbed-columns>
    </div>
  </div>
</template>

<script>
import BaseInputSelect from '/app/components/base-input-select.vue'
import BaseInputText from '/app/components/base-input-text.vue'
import TabbedColumnsView from './tabbed-columns-view.vue'

export default {
  components: { baseInputSelect, BaseInputText },
  name: 'mx-samples-list',
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'tabbed-columns': TabbedColumnsView
  },
  data() {
    return {
      requiredColumns: [
        {
          key: 'LOCATION',
          title: 'Loc'
        },
        {
          key: 'ACRONYM',
          title: 'Protein Acronym'
        },
        {
          key: 'NAME',
          title: 'Name'
        },
        {
          key: 'SAMPLEGROUP',
          title: 'Sample Group'
        }
      ],
      basicColumns: [
        {
          key: 'ANOLAMLOUS',
          title: 'Anomalous'
        },
        {
          key: 'COMMENT',
          title: 'Comment'
        }
      ],
      extraFieldsColumns: [
        {
          key: 'USERPATH',
          title: 'User Path'
        },
        {
          key: 'SPACEGROUP',
          title: 'Spacegroup'
        },
        {
          key: 'CELLS',
          title: 'Unit Cell'
        }
      ],
      udcColumns: [
        {
          key: 'CENTERINGMETHOD',
          title: 'Centering Method'
        },
        {
          key: 'EXPERIMENTKIND',
          title: 'Experiment Kind'
        },
        {
          key: 'ENERGY',
          title: 'Energy(eV)'
        },
        {
          key: 'ANOMALOUS',
          title: 'Anomalous'
        },
        {
          key: 'SCREENINGMETHOD',
          title: 'Screening Method'
        },
        {
          key: 'REQUIREDRES',
          title: 'Reqd Res'
        },
        {
          key: 'MINRES',
          title: 'Min Res'
        },
        {
          key: 'NUMTOCOLLECT',
          title: 'No to collect'
        }
      ],
      currentTab: 'basic',
      samples: []
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
    }
  },
  methods: {
    handleFieldChange(data, sampleIndex) {
      console.log({ data, sampleIndex })
    }
  }
}
</script>

<style>

</style>