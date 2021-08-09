<template>
  <processing-section
    section-title="Summary"
    :data-available="$store.state.ctfSummary.available"
    not-available-message="No CTF data available"
  >
    <summary-chart
      :x-axis="$store.state.ctfSummary.xAxis"
      :y-axis="$store.state.ctfSummary.astigmatism"
      title="Astigmatism"
    />
    <summary-chart
      :x-axis="$store.state.ctfSummary.xAxis"
      :y-axis="$store.state.ctfSummary.estimatedFocus"
      title="Estimated Focus"
    />
    <summary-chart
      :x-axis="$store.state.ctfSummary.xAxis"
      :y-axis="$store.state.ctfSummary.estimatedResolution"
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
            this.$store.dispatch('ctfSummary/fetch', this.autoProcProgramId)
        },
    },
}
</script>
