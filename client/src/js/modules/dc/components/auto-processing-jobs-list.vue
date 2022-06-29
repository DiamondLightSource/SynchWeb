<template>
  <div class="tw-w-full">
    <custom-table-component class="tw-overflow-x-auto" :data-list="processingProgramsList">
      <template v-slot:tableHeaders>
        <td class="rank-column"></td>
        <td class="type-column">Type</td>
        <td class="resolution-column">Resolution</td>
        <td class="space-group-column">Spacegroup</td>
        <td class="signal-column">Mn&lt;I/sig(i)&gt;</td>
        <td class="rmeas-column">Rmeas Inner</td>
        <td class="rmeas-column">Rmeas Outer</td>
        <td class="completeness-column">Completeness</td>
        <td class="cell-column">Cell</td>
        <td class="status-column">Status</td>
      </template>

      <template v-slot:slotData="{ dataList }">
        <custom-table-row
          :class="{
            'tw-w-full': true,
            'tw-cursor-pointer': true,
            'tw-bg-table-body-background': rowIndex % 2 === 0 && selectedProcessingProgram['AID'] !== result['AID'],
            'tw-bg-table-body-background-odd': rowIndex % 2 !== 0 && selectedProcessingProgram['AID'] !== result['AID'],
            'tw-bg-content-page-selected-background': selectedProcessingProgram['AID'] === result['AID']
          }"
          v-for="(result, rowIndex) in dataList"
          :key="rowIndex"
          :result="result"
          :row-index="rowIndex"
          @click.native="openProcessingProgramDetails(result)">
          <template v-slot:default="{ result, rowIndex }">
            <td class="rank-column">{{ rowIndex + 1 }}</td>
            <td class="type-column">{{ result['TYPE'] }}</td>
            <td class="resolution-column">{{ result['SHELLS'].overall['RHIGH'] }} - {{ result['SHELLS'].overall['RLOW'] }}</td>
            <td class="space-group-column">{{ result['SG'] }}</td>
            <td class="signal-column">{{ result['SHELLS'].overall['ISIGI'] }}</td>
            <td class="rmeas-column">{{ result['SHELLS'].innerShell['RMEAS'] }}</td>
            <td class="rmeas-column">{{ result['SHELLS'].outerShell['RMEAS'] }}</td>
            <td class="completeness-column">{{ result['SHELLS'].overall['COMPLETENESS'] }}</td>
            <td class="cell-column">{{ convertArrayValuesToString(getValuesFromObjectKeys(result['CELL'], ['CELL_A', 'CELL_B', 'CELL_C', 'CELL_AL', 'CELL_BE', 'CELL_GA']), ', ') }}</td>
            <td class="status-column">{{ result['PROCESSINGMESSAGE']}}</td>
          </template>
        </custom-table-row>
      </template>
    </custom-table-component>

    <auto-processing-job-details class="tw-mt-10" :selected-processing-program="selectedProcessingProgram"></auto-processing-job-details>
  </div>
</template>
<script>
import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'
import { at } from 'lodash-es'
import AutoProcessingJobDetails from 'modules/dc/components/auto-processing-job-details.vue'

export default {
  name: 'AutoProcessingJobsList',
  components: {
    'auto-processing-job-details': AutoProcessingJobDetails,
    'custom-table-row': CustomTableRow,
    'custom-table-component': CustomTableComponent
  },
  props: {
    processingProgramsList: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      selectedProcessingProgram: {}
    }
  },
  mounted() {
    this.openProcessingProgramDetails(this.processingProgramsList[0])
  },
  methods: {
    getValuesFromObjectKeys(object, keys) {
      return at(object, keys)
    },
    convertArrayValuesToString(array, separator = ',') {
      return array.join(separator)
    },
    openProcessingProgramDetails(selectedProgram) {
      this.selectedProcessingProgram = selectedProgram
    }
  }
}
</script>
<style scoped>
.rank-column {
  @apply tw-py-1;
  text-align: center;
  min-width: 24px;
}
.type-column, .space-group-column, .completeness-column {
  @apply tw-py-1;
  min-width: 192px;
}

.resolution-column, .status-column, .signal-column {
  @apply tw-py-1;
  min-width: 160px;
}

.rmeas-column {
  @apply tw-py-1;
  min-width: 128px;
}

.cell-column {
  @apply tw-py-1;
  min-width: 256px;
}
</style>
