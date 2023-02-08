<template>
  <div class="content">
    <h2>{{ containerName }}</h2>
    <custom-table-component
      :data-list="formattedSampleList"
      :headers="sampleHeaders"
      class="tw-w-full">
      <template v-slot:tableHeaders>
        <td class="tw-w-8 tw-py-2 tw-pl-2"><base-input-checkbox @input="toggleSelectAll" :value="allSelected"/></td>
        <td
          v-for="(header, index) in tableColumns" :key="index"
          class="tw-w-4/12 tw-py-2 tw-pl-2">
          {{ header.title }}
        </td>
      </template>
      <template v-slot:slotData="{ dataList }">
        <custom-table-row
          :class="['tw-w-full', 'tw-cursor-pointer', tableRowClass(result, rowIndex)]"
          v-for="(result, rowIndex) in dataList"
          :key="rowIndex"
          :result="result"
          :row-index="rowIndex">
          <td class="tw-w-8 tw-py-2 tw-pl-2"><base-input-checkbox @input="handleDropSelection(result)" :value="result['ISADDED']"/></td>
          <td class="tw-w-4/12 tw-py-2 tw-pl-2" v-for="(header, headerIndex) in tableColumns" :key="headerIndex">{{ result[header.key] }}</td>
        </custom-table-row>
      </template>
    </custom-table-component>
  </div>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import CustomTableComponent from 'app/components/custom-table-component.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'

export default {
  components: {
    CustomTableRow,
    'base-input-checkbox': BaseInputCheckbox,
    'custom-table-component': CustomTableComponent
  },
  props: {
    samples: {
      type: Array,
      required: true,
      default: () => ([])
    },
    selectedSamples: {
      type: Array,
      required: true,
      default: () => ([])
    },
    containerName: {
      type: String
    }
  },
  name: 'puck-table-view',
  mounted() {
    this.formatSamplesList()
  },
  data() {
    return {
      formattedSampleList: [],
      tableColumns: [
        { title: 'Location', key: 'LOCATION' },
        { title: 'Protein Acronym', key: 'ACRONYM' },
        { title: 'Sample Name', key: 'NAME' },
      ],
      allSelected: false
    }
  },
  methods: {
    formatSamplesList() {
      this.formattedSampleList = cloneDeep(this.samples).map(sample => {
        return {
          ...sample,
          ISADDED: !!this.selectedSamples.find(drop => drop['BLSAMPLEID'] === sample['BLSAMPLEID'])
        }
      })
    },
    handleDropSelection(drop) {
      if (drop['ISADDED']) {
        this.$emit('unselect-cell', [drop['LOCATION']])
      } else {
        this.$emit('cell-clicked', [drop['LOCATION']])
      }
    },
    toggleSelectAll() {
      const dropsList = this.formattedSampleList.map(sample => sample['LOCATION'])
      if (!this.allSelected) {
        this.$emit('cell-clicked', dropsList)
      } else {
        this.$emit('unselect-cell', dropsList)
      }

      this.allSelected = !this.allSelected
    },
    tableRowClass(row, rowIndex) {
      if (row['ISADDED'] && rowIndex % 2 === 0) {
        return 'tw-bg-sample-group-added-light'
      } else if (row['ISADDED'] && rowIndex % 2 !== 0) {
        return 'tw-bg-sample-group-added-dark'
      } else if (!row['ISADDED'] && rowIndex % 2 !== 0) {
        return 'tw-bg-table-body-background-odd'
      } else if (!row['ISADDED'] && rowIndex % 2 === 0) {
        return 'tw-bg-table-body-background'
      }
    }
  },
  computed: {
    sampleHeaders() {
      return [{ title: '', key: '' }, ...this.tableColumns]
    },
  },
  watch: {
    selectedSamples: {
      handler: 'formatSamplesList',
      immediate: true,
      deep: true
    },
    samples: {
      handler: 'formatSamplesList',
      immediate: true,
      deep: true
    }
  }
}
</script>