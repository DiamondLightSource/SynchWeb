<template>
  <div
    class="plotly-chart"
    :title="title"
    @click="click"
  />
</template>

<script>
import Plotly from 'utils/plotly-loader'

export default {
    'name': "PlotlyChart",
    'props': {
        'layout': {
            'type': Object,
            'required': true,
        },
        'chartData': {
            'type': Array,
            'required': true,
        },
        'title': {
            'type': String,
            'required': true,
        },
        'static': {
            'type': Boolean,
            'default': false,
        }
    },
    'data': function() {
        return {
            'chartActive': false,
        }
    },
    'watch': {
        'layout': function() {
            this.showChart()
        },
        'chartData': function() {
            this.showChart()
        },
    },
    'mounted': function () {
        this.showChart()
    },
    'beforeDestroy': function() {
        this.destroyChart()
    },
    'methods': {
        'destroyChart': function() {
            if (this.chartActive) {
                Plotly.purge(this.$el)
                this.chartActive = false
            }
        },
        'showChart': function() {
            this.destroyChart()
            const options = this.static ? {
                'staticPlot': true,
            } : {
                'displaylogo': false,

                // displayModebar is handy when trying to debug Plotly
                // modebar issues!
                // 'displayModeBar': true,
            }
            Plotly.newPlot(this.$el, this.chartData, this.layout, options);
        },
        'click': function() {
            if (this.static) {
                this.$emit('click')
            }
        },
    },
}
</script>

<style scoped>
.plotly-chart {
    background: #dadada;
}
</style>

<style>
/* Override the setting of the background colour of .active in
   src/css/partials/_utility.scss @ line 64 */
.modebar-group .active {
    background: none;
}
</style>
