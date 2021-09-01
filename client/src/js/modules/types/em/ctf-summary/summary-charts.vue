<template>
  <processing-section
    section-title="Summary"
    :data-available="isActive"
    not-available-message="No CTF data available"
  >
    <plotly-dialog
      :layout="layoutAstigmatism"
      :chart-data="dataAstigmatism"
      :annotations="annotations.astigmatism"
      title="Astigmatism"
      style="width: 33%"
      @select="select"
    />

    <plotly-dialog
      :layout="layoutEstimatedDefocus"
      :chart-data="dataEstimatedDefocus"
      :annotations="annotations.estimatedDefocus"
      title="Estimated Defocus"
      style="width: 33%"
      @select="select"
    />

    <plotly-dialog
      :layout="layoutEstimatedResolution"
      :chart-data="dataEstimatedResolution"
      :annotations="annotations.estimatedResolution"
      title="Estimated Resolution"
      style="width: 33%"
      @select="select"
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
            'points': 0,
            'xAxis': [],
            'yAxes': {
                'astigmatism': [],
                'estimatedDefocus': [],
                'estimatedResolution': [],
            },
            'annotations': {
                'astigmatism': '[]',
                'estimatedDefocus': '[]',
                'estimatedResolution': '[]',
            },
        }
    },
    'computed': {
        'isActive': function() {
            return this.points > 0
        },
        'layoutAstigmatism': function() {
            var layout = this.layoutBasic
            layout.yaxis = {
                'title': 'Å'
            }
            return JSON.stringify(layout)
        },
        'dataAstigmatism': function() {
            return this.plotlyData(this.yAxes.astigmatism)
        },
        'layoutEstimatedDefocus': function() {
            var layout = this.layoutBasic
            layout.yaxis = {
                'title': 'μm'
            }
            return JSON.stringify(layout)
        },
        'dataEstimatedDefocus': function() {
            return this.plotlyData(this.yAxes.estimatedDefocus)
        },
        'layoutEstimatedResolution': function() {
            var layout = this.layoutBasic
            layout.yaxis = {
                'title': 'Å',
                'range': [0, 10],
            }
            return JSON.stringify(layout)
        },
        'dataEstimatedResolution': function() {
            return this.plotlyData(this.yAxes.estimatedResolution)
        },
        'layoutBasic': function () {
            return {
                'xaxis': {
                    'autotick': false,
                    'tick0': 0,
                    'dtick': this.points / 10,
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
        'select': function(selection) {
            const x = selection.point
            const movie = (x + 1).toString()
            for (const chart in this.annotations) {
                const y = this.yAxes[chart][x]
                this.annotations[chart] = JSON.stringify([{
                    'text': movie,
                    'x': x,
                    'y': y,
                }])
            }
        },
        'plotlyData': function(yAxis) {
            return JSON.stringify([{
                'x': this.xAxis,
                'y': yAxis,
                'type': 'scatter',
                'mode': 'markers',
            }])
        },
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
                    this.xAxis = []
                    this.yAxes.astigmatism = []
                    this.yAxes.estimatedDefocus = []
                    this.yAxes.estimatedResolution = []
                    response.forEach((row) => {
                        this.xAxis.push(row.movieNumber)
                        for (const chart in this.yAxes) {
                            // the estimatedDefocus chart should be in microns
                            const value = chart == 'estimatedDefocus' ?
                                row[chart] / 1000.0 : row[chart]
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
