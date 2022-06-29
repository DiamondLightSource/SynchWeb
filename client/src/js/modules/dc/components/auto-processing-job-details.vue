<template>
  <div class="tw-w-full content tw-border tw-rounded tw-p-2">
    <h2 class="tw-mb-3">{{ selectedProcessingProgram['TYPE'] }} processing job details</h2>
    <div class="tw-w-full">
      <div
        :class="['tw-w-full', 'tw-rounded', iconMappings[messageTypeIndex].containerClassNames, 'tw-p-2']" v-for="(messageType, messageTypeIndex) in selectedProgramMessages" :key="messageTypeIndex">
        <p
          :id="`${messageTypeIndex}-trigger`"
          class="tw-py-1 tw-cursor-pointer"
          @click="toggleSiblingsDisplay(`${messageTypeIndex}-trigger`)">
          <span><i :class="[iconMappings[messageTypeIndex].iconClassNames]"></i> </span> {{ messageType.length }} {{ iconMappings[messageTypeIndex].iconMessage }}
        </p>

        <div
          :class="['tw-w-full', 'tw-rounded', 'tw-my-1', 'tw-p-2', 'tw-hidden', iconMappings[messageTypeIndex].containerClassNames]"
          v-for="(message, messageIndex) in messageType"
          :key="messageIndex">
          <p
            :id="`message-${messageIndex}-trigger`"
            class="tw-py-1 tw-cursor-pointer"
            @click="toggleSiblingsDisplay(`message-${messageIndex}-trigger`)">
            <span><i :class="[iconMappings[messageTypeIndex].childIconClassName]"></i> </span> {{ message['MESSAGE'] }}
          </p>
          <div class="tw-mt-1 tw-hidden"><pre v-html="message['DESCRIPTION']" class="tw-font-mono tw-border-t tw-pt-2"></pre></div>
        </div>
      </div>
    </div>

    <div class="tw-w-full tw-flex tw-justify-end tw-mt-4">
      <p v-if="selectedProcessingProgram['IMAGESWEEPCOUNT'] > 1" class="tw-text-link-color">{{ selectedProcessingProgram['IMAGESWEEPCOUNT'] }} image sweeps</p>
      <router-link v-if="selectedProcessingProgram['DCCOUNT'] > 1" :to="`/dc/pjid/${selectedProcessingProgram['PROCESSINGJOBID']}`" class="button tw-mx-1 tw-text-link-color"><span><i class="fa fa-list"></i></span> {{ selectedProcessingProgram['DCCOUNT'] }} Data Sets</router-link>
      <button class="button tw-mx-1 tw-text-link-color"><span><i class="fa fa-line-chart"></i></span> Plots</button>
      <router-link :to="`${apiUrl}/download/ap/archive/${selectedProcessingProgram['AID']}`" class="button tw-mx-1"><span><i class="fa fa-archive"></i></span> Archive</router-link>
      <button class="button tw-mx-1 tw-text-link-color"><span><i class="fa fa-files-o"></i></span> Logs &amp; Files</button>
      <button v-if="selectedProcessingProgram['TYPE'] === 'fast_dp'" class="button tw-text-link-color"><span><i class="fa fa-search"></i></span> Radiation Damage</button>
      <router-link class="button tw-mx-1" title="Lookup Unit Cell" :to="lookUpUrl"><span></span><i class="fa fa-search"></i> Lookup Cell</router-link>
    </div>

    <div class="tw-w-full tw-mb-4">
      <custom-table-component :data-list="beamTableData">
        <template v-slot:tableHeaders>
          <td class="tw-w-48 tw-py-1 tw-pl-2">Beam Centre</td>
          <td class="tw-w-48 tw-py-1">X</td>
          <td class="tw-w-48 tw-py-1">Y</td>
        </template>

        <template v-slot:slotData="{ dataList }">
          <custom-table-row
            :class="['tw-w-full', rowIndex % 2 === 0 ? 'tw-bg-table-body-background' : 'tw-bg-table-body-background-odd']"
            v-for="(result, rowIndex) in dataList"
            :key="rowIndex"
            :result="result"
            :row-index="rowIndex">
            <template v-slot:default="{ result }">
              <td class="tw-w-48 tw-py-1 tw-pl-2" v-html="result.name"></td>
              <td class="tw-w-48 tw-py-1">{{ result.xValue }}</td>
              <td class="tw-w-48 tw-py-1">{{ result.yValue }}</td>
            </template>
          </custom-table-row>
        </template>
      </custom-table-component>

      <p v-if="validBeamDataValue" class="message alert">WARNING: Beam centre has moved significantly during refinement! (>0.5mm)</p>
    </div>

    <div class="tw-w-full tw-mb-4">
      <custom-table-component :data-list="cellInformationTable">
        <template v-slot:tableHeaders>
          <td class="tw-w-48 tw-py-1 tw-pl-2">Space Group</td>
          <td class="tw-w-24 tw-py-1">A</td>
          <td class="tw-w-24 tw-py-1">B</td>
          <td class="tw-w-24 tw-py-1">C</td>
          <td class="tw-w-24 tw-py-1">&alpha;</td>
          <td class="tw-w-24 tw-py-1">&beta;</td>
          <td class="tw-w-24 tw-py-1">&gamma;</td>
        </template>

        <template v-slot:slotData="{ dataList }">
          <custom-table-row
            :class="['tw-w-full', rowIndex % 2 === 0 ? 'tw-bg-table-body-background' : 'tw-bg-table-body-background-odd']"
            v-for="(result, rowIndex) in dataList"
            :key="rowIndex"
            :result="result"
            :row-index="rowIndex">
            <template v-slot:default="{ result }">
              <td class="tw-w-48 tw-py-1 tw-pl-2">{{ result.spaceGroup }}</td>
              <td class="tw-w-24 tw-py-1">{{ result.cellA }}</td>
              <td class="tw-w-24 tw-py-1">{{ result.cellB }}</td>
              <td class="tw-w-24 tw-py-1">{{ result.cellC }}</td>
              <td class="tw-w-24 tw-py-1">{{ result.cellAlpha }}</td>
              <td class="tw-w-24 tw-py-1">{{ result.cellBeta }}</td>
              <td class="tw-w-24 tw-py-1">{{ result.cellGamma }}</td>
            </template>
          </custom-table-row>
        </template>
      </custom-table-component>
    </div>

    <div class="tw-w-full tw-mb-2">
      <custom-table-component :data-list="shellInformationData">
        <template v-slot:tableHeaders>
          <td class="tw-w-48 tw-py-1 tw-pl-2">Shell</td>
          <td class="tw-w-48 tw-py-1">Observations</td>
          <td class="tw-w-48 tw-py-1">Unique</td>
          <td class="tw-w-48 tw-py-1">Resolution</td>
          <td class="tw-w-48 tw-py-1">Rmeas</td>
          <td class="tw-w-48 tw-py-1">I/sig(i)</td>
          <td class="tw-w-48 tw-py-1">CC Half</td>
          <td class="tw-w-56 tw-py-1">Completeness</td>
          <td class="tw-w-56 tw-py-1">Multiplicity</td>
          <td class="tw-w-64 tw-py-1">Anom Completeness</td>
          <td class="tw-w-64 tw-py-1">Anom Multiplicity</td>
          <td class="tw-w-40 tw-py-1">CC Anom</td>
        </template>

        <template v-slot:slotData="{ dataList }">
          <custom-table-row
            :class="['tw-w-full', rowIndex % 2 === 0 ? 'tw-bg-table-body-background' : 'tw-bg-table-body-background-odd']"
            v-for="(result, rowIndex) in dataList"
            :key="rowIndex"
            :result="result"
            :row-index="rowIndex">
            <template v-slot:default="{ result, rowIndex }">
              <td class="tw-w-48 tw-py-1 tw-pl-2">{{ result['NAME'] }}</td>
              <td class="tw-w-48 tw-py-1">{{ result['NTOBS'] }}</td>
              <td class="tw-w-48 tw-py-1">{{ result['NUOBS'] }}</td>
              <td class="tw-w-48 tw-py-1">{{ result['RHIGH'] }} - {{ result['RLOW'] }}</td>
              <td class="tw-w-48 tw-py-1">{{ result['RMEAS'] }}</td>
              <td class="tw-w-48 tw-py-1">{{ result['ISIGI'] }}</td>
              <td class="tw-w-48 tw-py-1">{{ result['CCHALF'] }}</td>
              <td class="tw-w-56 tw-py-1">{{ result['COMPLETENESS'] }}</td>
              <td class="tw-w-56 tw-py-1">{{ result['MULTIPLICITY'] }}</td>
              <td class="tw-w-64 tw-py-1">{{ result['ANOMCOMPLETENESS'] }}</td>
              <td class="tw-w-64 tw-py-1">{{ result['ANOMMULTIPLICITY'] }}</td>
              <td class="tw-w-40 tw-py-1">{{ result['CCANOMALOUS'] }}</td>
            </template>
          </custom-table-row>
        </template>
      </custom-table-component>
    </div>
  </div>
</template>
<script>
import CustomTableRow from 'app/components/custom-table-row.vue'
import CustomTableComponent from 'app/components/custom-table-component.vue'
import { has } from "lodash-es";

export default {
  name: 'AutoProcessingJobDetails',
  components: {
    'custom-table-row': CustomTableRow,
    'custom-table-component': CustomTableComponent
  },
  props: {
    selectedProcessingProgram: {
      type: [Object, null],
    }
  },
  data() {
    return {
      apiUrl: '',
      iconMappings: {
        INFO: {
          iconClassNames: 'fa fa-info-circle icon tw-text-green-600',
          containerClassNames: 'tw-border tw-border-info-color tw-bg-info-color-lighter ',
          iconMessage: 'check(s) passed',
          childIconClassName: 'fa fa-check icon tw-text-green-600'
        },
        WARNING: {
          iconClassNames: 'fa fa-exclamation-triangle icon tw-text-orange-600',
          containerClassNames: 'tw-border tw-border-alert-color tw-bg-alert-color-lighter ',
          iconMessage: 'alert(s)',
          childIconClassName: 'fa fa-exclamation icon tw-text-orange-600'
        },
        ERROR: {
          iconClassNames: 'fa fa-exclamation-circle icon tw-text-red-600',
          containerClassNames: 'tw-border tw-border-warning-color tw-bg-warning-color-lighter ',
          iconMessage: 'alert(s)',
          childIconClassName: 'fa fa-times icon tw-text-red-600'
        }
      },
    }
  },
  computed: {
    selectedProgramCell() {
      if (this.selectedProcessingProgram && this.selectedProcessingProgram['CELL']) {
        return this.selectedProcessingProgram['CELL']
      }

      return {}
    },
    lookUpUrl() {
      if (has(this.selectedProgramCell, 'CELL_A')) {
        const { CELL_A, CELL_B, CELL_C, CELL_AL, CELL_BE, CELL_GA } = this.selectedProgramCell
        return `/cell/a/${CELL_A}/b/${CELL_B}/c/${CELL_C}/al/${CELL_AL}/be/${CELL_BE}/ga/${CELL_GA}`
      }

      return ''
    },
    beamData() {
      return this.selectedProcessingProgram['BEAM']
    },
    beamTableData() {
      if (this.beamData) {
        return [
          {
            name: 'Start',
            xValue: this.beamData['XBEAM'] ? this.beamData['XBEAM'] : '- -',
            yValue: this.beamData['YBEAM'] ? this.beamData['YBEAM'] : '- -'
          },
          {
            name: 'Refined',
            xValue: this.beamData['REFINEDXBEAM'] ? this.beamData['REFINEDXBEAM'] : '- -',
            yValue: this.beamData['REFINEDYBEAM'] ? this.beamData['REFINEDYBEAM'] : '- -'
          },
          {
            name: '&Delta;',
            xValue: this.beamData['XBEAM'] && this.beamData['REFINEDXBEAM'] ? (this.beamData['XBEAM'] - this.beamData['REFINEDXBEAM']).toFixed(2) : '- -',
            yValue: this.beamData['YBEAM'] && this.beamData['REFINEDYBEAM'] ? (this.beamData['YBEAM'] - this.beamData['REFINEDYBEAM']).toFixed(2) : '- -'
          }
        ]
      }

      return []
    },
    cellInformationTable() {
      const spaceGroup = this.selectedProcessingProgram['SG']
      if (spaceGroup && (has(this.selectedProgramCell, 'CELL_A'))) {
        const { CELL_A, CELL_B, CELL_C, CELL_AL, CELL_BE, CELL_GA } = this.selectedProgramCell
        return [
          {
            spaceGroup,
            cellA: CELL_A,
            cellB: CELL_B,
            cellC: CELL_C,
            cellAlpha: CELL_AL,
            cellBeta: CELL_BE,
            cellGamma: CELL_GA
          }
        ]
      }

      return []
    },
    shellInformationData() {
      if (this.selectedProcessingProgram && this.selectedProcessingProgram['SHELLS']) {
        const shellData = this.selectedProcessingProgram['SHELLS']

        return Object.keys(shellData).reduce((acc, curr) => {
          acc.push({
            NAME: curr,
            ...shellData[curr]
          })

          return acc
        }, [])
      }

      return []
    },
    selectedProgramMessages() {
      if (this.selectedProcessingProgram && this.selectedProcessingProgram['MESSAGES']) {
        return this.selectedProcessingProgram['MESSAGES'].reduce((acc, curr) => {
          if (!acc[curr['SEVERITY']]) {
            acc[curr['SEVERITY']] = []
          }

          acc[curr['SEVERITY']].push(curr)

          return acc
        }, {})
      }

      return {}
    },
    validBeamDataValue() {
      if (this.beamData) {
        return this.beamData['REFINEDYBEAM'] > 0
          && (
            Math.abs(this.beamData['XBEAM'] - this.beamData['REFINEDYBEAM']) > 0.5
            || Math.abs(this.beamData['YBEAM']-this.beamData['REFINEDXBEAM']) > 0.5
          )
      }
    }
  },
  methods: {
    toggleSiblingsDisplay(id) {
      $(`#${id}`).siblings().toggle('tw-hidden')
    }
  }
}
</script>