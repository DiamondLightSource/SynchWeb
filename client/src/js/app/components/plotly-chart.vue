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
            // A JSON string of an object
            // This is JSON to prevent Vue "polluting" it with observers
            'type': String,
            'required': true,
        },
        'chartData': {
            // A JSON string of an array
            // This is JSON to prevent Vue "polluting" it with observers
            'type': String,
            'required': true,
        },
        'annotations': {
            /* A JSON string of an array
             * This is JSON to prevent Vue "polluting" it with observers
             */
            'type': String,
            'default': '[]',
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
        }
    },
    'watch': {
        'layout': function() {
            this.showChart()
        },
        'chartData': function() {
            this.showChart()
        },
        'annotations': function() {
            this.redrawChart()
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
        'redrawChart': function() {
            if (this.chartActive) {
                Plotly.relayout(this.$el, {
                    'annotations': JSON.parse(this.annotations),
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
                // displayModebar is handy when trying to debug Plotly
                // modebar issues!
                // 'displayModeBar': true,
            }

            const layout = JSON.parse(this.layout)
            const annotations = JSON.parse(this.annotations)
            if (annotations.length > 0) {
                layout.annotations = annotations
            }

            const data = JSON.parse(this.chartData)

            Plotly.newPlot(this.$el, data, layout, options);

            if (!this.static) {
                this.$el.on('plotly_click', (clickEvent) => {
                    this.$emit('select', clickEvent);
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
