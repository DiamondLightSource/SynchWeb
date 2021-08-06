<template>
  <div
    class="ice-breaker-histogram"
    :style="proportionalHeight"
    :title="titleText"
  />
</template>

<script>
import proportionalHeight from 'modules/types/em/components/proportional-height'
import plotly from 'utils/plotly-loader'

export default {
    'name': "Histogram",
    'mixins': [proportionalHeight],
    'props': {
        'attachment': {
            'type': Object,
            'required': true,
        },
    },
    'data': function() {
        return {
            'titleText': '',
        }
    },
    'mounted': function() {
        const plotData = JSON.parse(this.attachment.plotData)
        const layout = plotData.layout
        this.titleText = layout.title.text.split('<br>')[1]
        plotly.newPlot(this.$el, plotData.data, {
            'barmode': layout.barmode,
            'xaxis': layout.xaxis,
            'yaxis': layout.yaxis,
            'margin': { 'l': 50, 'r': 10, 'b': 50, 't': 10 },
        })
    },
}
</script>

<style>
.ice-breaker-histogram {
    background: #dadada;
    overflow: hidden;
    width: 400px;
    border-radius: 6px;
}
</style>
