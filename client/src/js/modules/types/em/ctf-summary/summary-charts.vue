<template>
  <processing-section
    section-title="Summary"
    :data-available="hasData"
    not-available-message="No CTF data available"
  >
    <dialog-plotly
      :layout="layoutAstigmatism"
      :chart-data="dataAstigmatism"
      :annotations="annotations.astigmatism"
      title="Astigmatism"
      class="summary-chart"
      @select="select"
    />

    <dialog-plotly
      :layout="layoutEstimatedDefocus"
      :chart-data="dataEstimatedDefocus"
      :annotations="annotations.estimatedDefocus"
      title="Estimated Defocus"
      class="summary-chart"
      @select="select"
    />

    <dialog-plotly
      :layout="layoutEstimatedResolution"
      :chart-data="dataEstimatedResolution"
      :annotations="annotations.estimatedResolution"
      title="Estimated Resolution"
      class="summary-chart"
      @select="select"
    />
  </processing-section>
</template>

<script>
import DialogPlotly from 'modules/types/em/components/dialog-plotly.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': 'ProcessingSummary',
    'components': {
        'dialog-plotly': DialogPlotly,
        'processing-section': ProcessingSection,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
        'fetchTrigger': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'points': 0,
            'xAxis': [],
            'yAxes': {
                'astigmatism': [],
                'estimatedDefocus': [],
                'estimatedResolution': [],
            },
            'annotations': {
                'astigmatism': [],
                'estimatedDefocus': [],
                'estimatedResolution': [],
            },
        }
    },
    'computed': {
        'hasData': function() {
            return this.points > 0
        },
        'layoutAstigmatism': function() {
            return this.plotlyLayout({
                'title': 'Å',
                'rangemode': 'tozero',
            })
        },
        'dataAstigmatism': function() {
            return this.plotlyData(this.yAxes.astigmatism)
        },
        'layoutEstimatedDefocus': function() {
            return this.plotlyLayout({
                'title': 'μm',
                'rangemode': 'tozero',
            })
        },
        'dataEstimatedDefocus': function() {
            return this.plotlyData(this.yAxes.estimatedDefocus)
        },
        'layoutEstimatedResolution': function() {
            return this.plotlyLayout({
                'title': 'Å',
                'range': [0, 10],
            })
        },
        'dataEstimatedResolution': function() {
            return this.plotlyData(this.yAxes.estimatedResolution)
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'fetchTrigger': function(newValue, oldValue) {
            this.fetch()
        },
    },
    'mounted': function() {
        this.fetch()
    },
    'methods': {
        'select': function(selection) {
            const x = selection.x
            const point = selection.point
            const label = x.toString()
            for (const chart in this.annotations) {
                const y = this.yAxes[chart][point]
                this.annotations[chart] = [{
                    'text': label,
                    'x': x,
                    'y': y,
                }]
            }
            selection.chart.close();
            this.$store.commit('em/selectMovies', x)
        },
        'plotlyData': function(yAxis) {
            return [{
                'x': this.xAxis,
                'y': yAxis,
                'type': 'scatter',
                'mode': 'markers',
            }]
        },
        'plotlyLayout': function(yAxis) {
            return {
                'xaxis': {
                    'autotick': false,
                    'tick0': 0,
                    'dtick': this.points / 10,
                    'title': 'movie'
                },
                'yaxis': yAxis,
                'margin': { 't': 10, 'l': 40, 'r': 20, 'b': 30 },
            }
        },
        'fetch': function() {
            // If this job has not yet run, autoProcProgramId "doesn't exist"
            if (! this.autoProcProgramId) {
                return
            }
            this.$store.dispatch('em/fetch', {
                'url': '/em/ctf/summary/' + this.autoProcProgramId,
                'humanName': 'CTF summary data',
            }).then(
                (response) => {
                    // TODO: would this be better in the API?
                    this.xAxis = []
                    this.yAxes.astigmatism = []
                    this.yAxes.estimatedDefocus = []
                    this.yAxes.estimatedResolution = []
                    response.forEach((row) => {
                        this.xAxis.push(row.movieNumber)
                        for (const chart in this.yAxes) {
                            // the estimatedDefocus chart should be in μm
                            const value = chart == 'estimatedDefocus' ?
                                row[chart] / 10000.0 : row[chart]
                            this.yAxes[chart].push(value)
                        }
                    })
                    this.points = response.length
                }
            )
        },
    },
}
</script>

<style scoped>
.summary-chart {
    width: 33%;
}
</style>
