<template>
  <processing-section
    section-title="Summary"
    :data-available="dataAvailable"
    not-available-message="No CTF data available"
  >
    <template v-for="(plotData, key) in ctfSummaryData">
      <summary-chart
        v-if="typeof plotData == 'string'"
        :key="key"
        :plot-data="plotData"
      />
    </template>
  </processing-section>
</template>

<script>
import CtfSummaryModel from 'modules/types/em/models/ctf-summary'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import SummaryChart from 'modules/types/em/dc/ap/summary-charts/summary-chart.vue'

export default {
    'name': 'ProcessingSummary',
    'components': {
        'processing-section': ProcessingSection,
        'summary-chart': SummaryChart,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function () {
        return {
            'ctfSummaryData': null,
        }
    },
    'computed': {
        'ctfSummaryModel': function() {
            return new CtfSummaryModel({
                'id': this.autoProcProgramId,
            })
        },
        'dataAvailable': function() {
            return this.ctfSummaryData !== null &&
                this.ctfSummaryData.dataAvailable === true
        }
    },
    'mounted': function() {
        this.fetchSummaryModel()
    },
    'methods': {
        'fetchSummaryModel': function() {
            if (! this.autoProcProgramId) {
                return
            }

            this.$store.commit('loading', true)
            this.$store.dispatch('getModel', this.ctfSummaryModel).then(
                (model) => {
                    this.ctfSummaryData = model.attributes
                    console.log('fetched summary CTF data', this.ctfSummaryData)
                    this.$store.commit('loading', false)
                },
                (error) => {
                    console.log('Could not retrieve autoprocessing summary', error)
                    this.$store.commit('loading', false)
                }
            )
        },
    },
}
</script>
