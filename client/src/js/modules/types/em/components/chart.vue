<template>
  <div
    class="container"
    :style="divStyle"
  >
    <div
      ref="plot"
      class="flotChart"
    />
  </div>
</template>

<script>
import $ from 'jquery'
import 'jquery.flot'
//import 'jquery.flot.resize'
//import 'jquery.flot.selection'
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': "Chart",
    'mixins': [proportionalHeight],
    'props': {
        'width': {
            'type': String,
            'default': '400px',
        },
        'options': {
            'type': Object,
            'required': true,
        },
        'plotData': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'flotChart': null,
        }
    },
    'computed': {
        'divStyle': function() {
            return this.proportionalHeight + ' width: ' + this.width + ';'
        },
    },
    'watch': {
        'plotData': function(
            newValue,
            oldValue // eslint-disable-line no-unused-vars
        ) {
            this.plotChart(newValue);
        },
    },
    'mounted': function() {
        this.plotChart(this.plotData);
    },
    'beforeUnmount': function () {
        this.plot.shutdown()
    },
    'methods': {
        'plotChart': function(stringifiedData) {
            if (!stringifiedData) {
                return;
            }
            // data is stringified in the model to prevent Vue
            // "polluting" it with observers
            const parsedData = JSON.parse(stringifiedData)
            if (this.flotChart === null) {
                this.flotChart = $.plot(
                    this.$refs.plot, [parsedData], this.options
                )
            } else {
                this.flotChart.setData([parsedData])
            }
            this.flotChart.draw()
        }
    }
}
</script>

<style scoped>
.container {
    background-color: #fff;
    border-radius: 6px;
    padding: 10px;
}
.flotChart {
    width: 100%;
    height: 100%;
}
</style>
