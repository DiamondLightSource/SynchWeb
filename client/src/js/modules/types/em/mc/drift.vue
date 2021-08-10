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
import DriftViewModel from 'modules/types/em/mc/drift-view-model.js'
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
        return DriftViewModel.defaultData()
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
            DriftViewModel.fetch(
                this.$store,
                this.autoProcProgramId,
                this.movieNumber
            ).then(
                (state) => {
                    this.chartData = state.chartData
                    this.points = state.points
                }
            )
        },
    },
}
</script>
