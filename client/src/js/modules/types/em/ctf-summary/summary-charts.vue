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
            'type': String,
            'required': true,
        },
        'fetchTrigger': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'xAxis': [],
            'text': [],
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
        'points': function() {
            return this.xAxis.length
        },
        'layoutAstigmatism': function() {
            return this.plotlyLayout({
                'title': 'Å',
                'rangemode': 'tozero',
                'fixedrange': true,
            })
        },
        'dataAstigmatism': function() {
            return this.plotlyData(this.yAxes.astigmatism)
        },
        'layoutEstimatedDefocus': function() {
            return this.plotlyLayout({
                'title': 'μm',
                'rangemode': 'tozero',
                'fixedrange': true,
            })
        },
        'dataEstimatedDefocus': function() {
            return this.plotlyData(this.yAxes.estimatedDefocus)
        },
        'layoutEstimatedResolution': function() {
            return this.plotlyLayout({
                'title': 'Å',
                'range': [0, 10],
                'fixedrange': true,
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
            const ax = selection.point > this.points / 2 ?
                -40 : 40
            for (const chart in this.annotations) {
                /*  We don't use selection.y here because that's the Y
                    coordinate on the chart that was clicked on... but we're
                    plotting on all 3 charts here, and their whole raison d'être
                    is to have different Y coordinates to each other */
                const y = this.yAxes[chart][selection.point]
                this.annotations[chart] = [{
                    'text': y + '<br>' + selection.text,
                    'x': selection.x,
                    'y': y,
                    'ax': ax,
                    'ay': -40,
                    'borderpad': 4,
                    'align': 'left',
                    'bgcolor': '#fff',
                }]
            }
            selection.chart.close();
            this.$store.commit('em/selectMovies', selection.point)
        },
        'plotlyData': function(yAxis) {
            const plotlyData = [{
                'x': this.xAxis,
                'text': this.text,
                'y': yAxis,
                'type': 'scatter',
                'mode': 'markers',
                'marker': { 'size': 4 },
            }]
            Object.freeze(plotlyData)
            return plotlyData
        },
        'plotlyLayout': function(yAxis) {
            return {
                'xaxis': {
                    'autorange': false,
                    'range': [ 0.75, this.points + 1.25 ],
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
            this.$store.dispatch('em/api/fetch', {
                'url': 'ctf/summary/' + this.autoProcProgramId,
                'humanName': 'CTF summary data',
            }).then(
                (response) => {
                    var xAxis = []
                    var text = []
                    var yAxes = {}
                    yAxes.astigmatism = []
                    yAxes.estimatedDefocus = []
                    yAxes.estimatedResolution = []
                    response.forEach((row) => {
                        xAxis.push(row.movieNumber)
                        text.push(
                            'Movie ' + row.movieNumber +
                            '<br>' + row.createdTimeStamp
                        )
                        for (const chart in yAxes) {
                            yAxes[chart].push(
                                // the estimatedDefocus chart should be in μm
                                chart == 'estimatedDefocus' ?
                                    row[chart] / 10000.0 : row[chart]
                            )
                        }
                    })
                    Object.freeze(xAxis)
                    Object.freeze(text)
                    Object.freeze(yAxes)
                    this.xAxis = xAxis
                    this.text = text
                    this.yAxes = yAxes
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
