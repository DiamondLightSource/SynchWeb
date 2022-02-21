<template>
  <div>
    <div class="tw-w-full"><button class="button"></button></div>
    <custom-table
      :data="formattedSampleList"
      :headers="sampleHeaders"
      class="puck-view-table"
      @row-clicked="handleDropSelection"
    >
      <template v-slot:table-headers="{ headers, sortHeader }">
        <th><base-input-checkbox @input="toggleSelectAll" :value="allSelected"/></th>
        <th
          v-for="(header, index) in tableColumns" :key="index"
          class=""
          @click="sortHeader(header)">
          {{header.title}}
        </th>
      </template>
      <template v-slot:default="{ data, rowClicked }">
        <tr
          v-for="(row, index) in data"
          :key="index"
          :class="{
            'sample-group-added': row['ISADDED'],
            'table-row': true
          }"
          @click="rowClicked(row)"
        >
          <td><base-input-checkbox @input="rowClicked(row)" :value="row['ISADDED']"/></td>
          <td v-for="(header, headerIndex) in tableColumns" :key="headerIndex">{{ row[header.key] }}</td>
        </tr>
      </template>
    </custom-table>
  </div>
</template>
<script>
import CustomTable from 'app/components/table.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import { cloneDeep } from 'lodash-es'

export default {
  components: {
    'base-input-checkbox': BaseInputCheckbox,
    'custom-table': CustomTable
  },
  props: {
    samples: {
      type: Array,
      required: true,
    },
    selectedSamples: {
      type: Array,
      required: true
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
    }
  }
}
</script>
<style scoped>
.puck-view-table tr.sample-group-added:nth-child(odd) td {
  background-color: #f4e7Ba
}
.puck-view-table tr.sample-group-added:nth-child(even) td {
  background-color: #e6daae
}
</style>