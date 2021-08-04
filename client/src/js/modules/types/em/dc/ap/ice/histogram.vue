<template>
  <div
    class="ice-breaker-histogram"
    :style="proportionalHeight"
    :title="attachment.timeStamp"
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
    'mounted': function() {
        const plotData = this.attachment.plotData
        plotly.newPlot(this.$el, plotData.data, plotData.layout)
    },
}
</script>

<style>
.ice-breaker-histogram {
    background: #dadada;
    overflow: hidden;
    width: 400px;
}
</style>
