<template>
  <plotly-dialog
    :is-active="isActive"
    :layout="layout"
    :chart-data="chartData"
    :title="title"
    width="30%"
  />
</template>

<script>
import PlotlyDialog from 'modules/types/em/components/plotly-dialog.vue'

export default {
    'name': "SummaryChart",
    'components': {
        'plotly-dialog': PlotlyDialog,
    },
    'props': {
        'xAxis': {
            'type': Array,
            'required': true,
        },
        'yAxis': {
            'type': Array,
            'required': true,
        },
        'title': {
            'type': String,
            'required': true,
        }
    },
    'computed': {
        'isActive': function() {
            return this.xAxis.length > 0 &&
              this.yAxis.length == this.xAxis.length
        },
        'layout': function () {
            return {
                'xaxis': {
                    'autotick': false,
                    'tick0': 0,
                    'dtick': this.xAxis.length / 10,
                },
                'margin': {
                    't': 10,
                    'l': 30,
                    'r': 20,
                    'b': 20,
                },
            }
        },
        'chartData': function() {
            return [{
                'x': this.xAxis,
                'y': this.yAxis,
                'type': 'bar',
            }]
        }
    },
}
</script>
