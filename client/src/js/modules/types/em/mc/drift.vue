<template>
  <plotly-dialog
    v-if="points > 0"
    :layout="layout"
    :chart-data="chartData"
    title="Drift"
    width="400px"
  />
</template>

<script>
import PlotlyDialog from 'modules/types/em/components/plotly-dialog.vue'

export default {
    'name': "Drift",
    'components': {
        'plotly-dialog': PlotlyDialog,
    },
    'props': {
        'autoProcProgramId' : {
            'type': Number,
            'required': true,
        },
        'movieNumber': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return this.buildModel([], [])
    },
    'computed': {
        'layout': function() {
            return JSON.stringify({
                'margin': { 't': 10, 'l': 30, 'r': 20, 'b': 20 },
                'xaxis': { 'range': [-20, 20] },
                'yaxis': { 'range': [-20, 20] },
            })
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
                'chartData': JSON.stringify([{
                    'x': xAxis,
                    'y': yAxis,
                    'type': 'scatter',
                    'mode': 'lines+markers',
                }]),
                'points': xAxis.length,
            }
        },
    },
}
</script>
