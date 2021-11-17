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
        'annotations': {
            'type': Array,
            'default': [],
        },
        'title': {
            'type': String,
            'default': '',
        },
        'static': {
            // Set to true if the chart is NOT interactive
            'type': Boolean,
            'default': false,
        }
    },
    'data': function() {
        return {
            'chartActive': false,
            'originalXAxis': [0, 0],
            'originalYAxis': [0, 0],
        }
    },
    'watch': {
        'annotations': function() {
            this.redrawChart()
        },
    },
    'mounted': function () {
        this.$watch(
            function() {
                return {
                    'layout': this.layout,
                    'data': this.chartData,
                }
            },
            this.showChart
        )
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
        'redrawChart': function() {
            if (this.chartActive) {
                Plotly.relayout(this.$el, {
                    'annotations': this.annotations,
                })
            }
        },
        'showChart': function() {
            this.destroyChart()
            this.chartActive = true

            const options = this.static ? {
                'staticPlot': true,
            } : {
                'displaylogo': false,
                'displayModeBar': true,
            }

            const layout = this.layout
            if (this.annotations.length > 0) {
                layout.annotations = this.annotations
            }

            /*  If you're looking for a massive performance sink,
                you've come to the right shop */
            Plotly.newPlot(this.$el, this.chartData, layout, options);

            if (!this.static) {
                this.$el.on('plotly_click', (clickEvent) => {
                    this.$emit('select', clickEvent);
                })
            }
        },
        'saveZoom': function() {
            this.originalXAxis = [
                this.layout.xaxis.range[0],
                this.layout.xaxis.range[1],
            ]
            this.originalYAxis = [
                this.layout.yaxis.range[0],
                this.layout.yaxis.range[1],
            ]
        },
        'restoreZoom': function() {
            if (this.chartActive) {
                Plotly.relayout(this.$el, {
                    'xaxis.range': this.originalXAxis,
                    'yaxis.range': this.originalYAxis,
                })
            }
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
