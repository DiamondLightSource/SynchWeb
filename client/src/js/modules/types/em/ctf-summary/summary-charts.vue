<template>
  <processing-section
    section-title="Summary"
    :data-available="isActive"
    not-available-message="No CTF data available"
  >
    <plotly-dialog
      :layout="layout"
      :chart-data="state.astigmatism"
      title="Astigmatism"
      width="30%"
    />

    <plotly-dialog
      :layout="layout"
      :chart-data="state.estimatedFocus"
      title="Estimated Focus"
      width="30%"
    />

    <plotly-dialog
      :layout="layout"
      :chart-data="state.estimatedResolution"
      title="Estimated Resolution"
      width="30%"
    />
  </processing-section>
</template>

<script>
import PlotlyDialog from 'modules/types/em/components/plotly-dialog.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import middleware from 'modules/types/em/ctf-summary/middleware'

export default {
    'name': 'ProcessingSummary',
    'components': {
        'plotly-dialog': PlotlyDialog,
        'processing-section': ProcessingSection,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'state': {
                'points': 0,
                'astigmatism': '',
                'estimatedFocus': '',
                'estimatedResolution': '',
            },
        }
    },
    'computed': {
        'isActive': function() {
            return this.state.points > 0
        },
        'layout': function () {
            return JSON.stringify({
                'xaxis': {
                    'autotick': false,
                    'tick0': 0,
                    'dtick': this.state.points / 10,
                },
                'margin': { 't': 10, 'l': 30, 'r': 20, 'b': 20 },
            })
        },
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
            this.$store.dispatch('em/fetch', {
                'url': '/em/ctf/summary/' + this.autoProcProgramId,
                'humanName': 'CTF summary data',
                'middleware': middleware,
            }).then(
                (ctfSummary) => { this.state = ctfSummary }
            )
        },
    },
}
</script>
