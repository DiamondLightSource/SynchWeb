<template>
  <dialog-plotly
    v-if="points > 0"
    :layout="layout"
    :chart-data="chartData"
    title="Drift"
    class="drift-chart"
  />
</template>

<script>
import DialogPlotly from 'modules/types/em/components/dialog-plotly.vue'

export default {
    'name': "Drift",
    'components': {
        'dialog-plotly': DialogPlotly,
    },
    'props': {
        'autoProcProgramId' : {
            'type': String,
            'required': true,
        },
        'imageNumber': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return this.buildModel([], [])
    },
    'computed': {
        'layout': function() {
            return {
                'margin': { 't': 10, 'l': 54, 'r': 54, 'b': 54 },
                'xaxis': {
                    'title': 'δx Å',
                    'range': [-20, 20],
                },
                'yaxis': {
                    'title': 'δy Å',
                    'range': [-20, 20],
                },
            }
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'imageNumber': function(newValue, oldValue) {
            this.fetch();
        },
    },
    'methods': {
        'fetch': function() {
            this.$store.dispatch('em/api/fetch', {
                'url': 'mc/drift/' + this.autoProcProgramId +
                    '/n/' + this.imageNumber,
                'humanName': 'MC Drift',
            }).then(
                (response) => {
                    const state = this.buildModel(response.xAxis, response.yAxis)
                    this.chartData = state.chartData
                    this.points = state.points
                },
                () => {
                    this.points = 0
                    this.chartData = {}
                }
            )
        },
        'buildModel': function(xAxis, yAxis) {
            return {
                'chartData': [{
                    'x': xAxis,
                    'y': yAxis,
                    'type': 'scatter',
                    'mode': 'lines+markers',
                }],
                'points': xAxis.length,
            }
        },
    },
}
</script>

<style scoped>
.drift-chart {
    width: 33%;
}
</style>