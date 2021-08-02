<template>
  <div
    ref="plot"
    :title="plotTitle"
    :style="plotDivStyle"
    style="width: 33%; float: left;"
  />
</template>

<script>
//import 'jquery.flot.resize'
//import 'jquery.flot.selection'
import $ from 'jquery'
import 'jquery.flot'
import chartOptions from 'modules/types/em/dc/ap/summary/chart-options'
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': "SummaryChart",
    'mixins': [proportionalHeight],
    'props': {
        // The plot data is in JSON to prevent Vue "polluting" it with observers
        'plotData': {
            'type': String,
            'required': true,
        },
    },
    'computed': {
        'parsedData': function() {
            return [JSON.parse(this.plotData)]
        },
        'plot': function() {
            return $.plot(
                this.$refs.plot,
                this.parsedData,
                chartOptions
            )
        },
        'plotTitle': function() {
            return this.plotData.label
        },
        'plotDivStyle': function() {
            const height = this.proportionalHeight + 'px;'
            return 'height: ' + height +
                ' min-height: ' + height +
                ' max-height: ' + height
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'plotData': function(newValue, oldValue) {
            this.updateAndPlot();
        },
    },
    'mounted': function () {
        this.updateAndPlot();
    },
    'beforeUnmount': function () {
        this.plot.shutdown()
    },
    'methods': {
        'updateAndPlot': function() {
            this.plot.setData(this.parsedData)
            this.plot.draw()
        },
    },
}
</script>
