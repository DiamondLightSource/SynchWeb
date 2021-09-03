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
            'type': Number,
            'required': true,
        },
        'movieNumber': {
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
                'margin': { 't': 10, 'l': 30, 'r': 30, 'b': 30 },
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
        'movieNumber': function(newValue, oldValue) {
            this.fetch();
        },
    },
    'mounted': function () {
        this.fetch();
    },
    'methods': {
        'fetch': function() {
            this.$store.dispatch('em/fetch', {
                'url': '/em/mc/drift/' + this.autoProcProgramId +
                    '/n/' + this.movieNumber,
                'humanName': 'MC Drift',
            }).then(
                (response) => {
                    const state = this.buildModel(response.xAxis, response.yAxis)
                    this.chartData = state.chartData
                    this.points = state.points
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
    width: 28%;
}
</style>