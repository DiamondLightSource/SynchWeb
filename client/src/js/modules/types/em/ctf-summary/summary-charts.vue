<template>
  <processing-section
    section-title="Summary"
    :data-available="isActive"
    not-available-message="No CTF data available"
  >
    <plotly-dialog
      :layout="layoutAstigmatism"
      :chart-data="state.astigmatism"
      title="Astigmatism"
      style="width: 33%"
    />

    <plotly-dialog
      :layout="layoutEstimatedDefocus"
      :chart-data="state.estimatedDefocus"
      title="Estimated Defocus"
      style="width: 33%"
    />

    <plotly-dialog
      :layout="layoutEstimatedResolution"
      :chart-data="state.estimatedResolution"
      title="Estimated Resolution"
      style="width: 33%"
    />
  </processing-section>
</template>

<script>
import PlotlyDialog from 'modules/types/em/components/plotly-dialog.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

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
                'estimatedDefocus': '',
                'estimatedResolution': '',
            },
        }
    },
    'computed': {
        'isActive': function() {
            return this.state.points > 0
        },
        'layoutAstigmatism': function() {
            var layout = this.layoutBasic
            layout.yaxis = {
                'title': 'Å'
            }
            return JSON.stringify(layout)
        },
        'layoutEstimatedDefocus': function() {
            var layout = this.layoutBasic
            layout.yaxis = {
                'title': 'μm'
            }
            return JSON.stringify(layout)
        },
        'layoutEstimatedResolution': function() {
            var layout = this.layoutBasic
            layout.yaxis = {
                'title': 'Å',
                'range': [0, 10],
            }
            return JSON.stringify(layout)
        },
        'layoutBasic': function () {
            return {
                'xaxis': {
                    'autotick': false,
                    'tick0': 0,
                    'dtick': this.state.points / 10,
                    'title': 'movie'
                },
                'margin': { 't': 10, 'l': 40, 'r': 20, 'b': 30 },
            }
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
            }).then(
                (response) => {
                    this.state = this.formatData(response)
                }
            )
        },
        'formatData': function(response) {
            var xAxis = []
            var yAxes = {
                'astigmatism': [],
                'estimatedDefocus': [],
                'estimatedResolution': [],
            }
            const chartData = function (key) {
                return JSON.stringify([{
                    'x': xAxis,
                    'y': yAxes[key],
                    'type': 'scatter',
                    'mode': 'markers',
                }])
            }
            response.forEach(function(row) {
                xAxis.push(row.movieNumber)
                Object.keys(yAxes).forEach(function(chart) {
                    // the estimatedDefocus chart should be in microns
                    const value = chart == 'estimatedDefocus' ?
                        row[chart] / 1000.0 : row[chart]
                    yAxes[chart].push(value)
                })
            })
            return {
                'points': response.length,
                'astigmatism': chartData('astigmatism'),
                'estimatedDefocus': chartData('estimatedDefocus'),
                'estimatedResolution': chartData('estimatedResolution'),
            }
        },
    },
}
</script>
