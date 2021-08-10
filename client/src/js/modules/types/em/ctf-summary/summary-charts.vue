<template>
  <processing-section
    section-title="Summary"
    :data-available="state.available"
    not-available-message="No CTF data available"
  >
    <summary-chart
      :x-axis="state.xAxis"
      :y-axis="state.astigmatism"
      title="Astigmatism"
    />
    <summary-chart
      :x-axis="state.xAxis"
      :y-axis="state.estimatedFocus"
      title="Estimated Focus"
    />
    <summary-chart
      :x-axis="state.xAxis"
      :y-axis="state.estimatedResolution"
      title="Estimated Resolution"
    />
  </processing-section>
</template>

<script>
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import SummaryChart from 'modules/types/em/ctf-summary/summary-chart.vue'
import ViewModel from 'modules/types/em/ctf-summary/view-model.js'

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
            'state': ViewModel.defaultData(),
        }
    },
    'mounted': function() {
        this.fetchData()
    },
    'methods': {
        'fetchData': function() {
            // If this job has not yet run, autoProcProgramId "doesn't exist"
            if (! this.autoProcProgramId) {
                return
            }
            ViewModel.fetch(this.$store, this.autoProcProgramId).then(
                (ctfSummary) => { this.state = ctfSummary }
            )
        },
    },
}
</script>
