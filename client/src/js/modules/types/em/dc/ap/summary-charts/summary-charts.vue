<template>
  <processing-section
    section-title="Summary"
    :data-available="available"
    not-available-message="No CTF data available"
  >
    <summary-chart
      :x-axis="xAxis"
      :y-axis="astigmatism"
      title="Astigmatism"
    />
    <summary-chart
      :x-axis="xAxis"
      :y-axis="estimatedFocus"
      title="Estimated Focus"
    />
    <summary-chart
      :x-axis="xAxis"
      :y-axis="estimatedResolution"
      title="Estimated Resolution"
    />
  </processing-section>
</template>

<script>
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import SummaryChart from 'modules/types/em/dc/ap/summary-charts/summary-chart.vue'
import StoreModule from 'modules/types/em/dc/ap/summary-charts/store-module.js'

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
    'data': function() {
        return {
            'available': false,
            'xAxis': [],
            'astigmatism': [],
            'estimatedFocus': [],
            'estimatedResolution': [],
        }
    },
    'beforeCreate': function() {
        if (! this.$store.hasModule('ctfSummary')) {
            this.$store.registerModule('ctfSummary', StoreModule);
        }
    },
    'mounted': function() {
        this.fetchData()
    },
    'beforeDestroy': function() {
        this.$store.unregisterModule('ctfSummary')
    },
    'methods': {
        'fetchData': function() {
            if (! this.autoProcProgramId) {
                return
            }
            this.$store.dispatch(
                'ctfSummary/fetch',
                this.autoProcProgramId
            ).then (
                (ctfSummary) => {
                    this.available = ctfSummary.available
                    this.xAxis = ctfSummary.xAxis
                    this.astigmatism = ctfSummary.astigmatism
                    this.estimatedFocus = ctfSummary.estimatedFocus
                    this.estimatedResolution = ctfSummary.estimatedResolution
                },
                () => {
                    this.available = false
                    this.xAxis = []
                    this.astigmatism = []
                    this.estimatedFocus = []
                    this.estimatedResolution = []
                }
            )
        },
    },
}
</script>
