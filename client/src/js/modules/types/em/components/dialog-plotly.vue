<template>
  <dialog-with-preview
    ref="dialog"
    :title="title"
  >
    <template #dialogContent>
      <plotly-chart
        :style="dialogChartStyle"
        :title="title"
        :layout="layout"
        :chart-data="chartData"
        :annotations="annotations"
        @select="select"
      />
    </template>

    <template #previewContent>
      <plotly-chart
        :style="previewChartStyle"
        class="preview-chart"
        static
        :layout="layout"
        :chart-data="chartData"
        :annotations="annotations"
        @click="showDialog = true"
      />
    </template>
  </dialog-with-preview>
</template>

<script>
////////////////////////////////////////////////////////////////////
//
// A simple static plotly chart that can be clicked on to open up a
// nearly full screen interactive version in a modal dialog
//
////////////////////////////////////////////////////////////////////

import DialogWithPreview from 'modules/types/em/components/dialog-with-preview.vue'
import PlotlyChart from 'app/components/plotly-chart.vue'
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': 'DialogPlotly',
    'components': {
        'dialog-with-preview': DialogWithPreview,
        'plotly-chart': PlotlyChart,
    },
    'mixins': [proportionalHeight],
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
            'default': function() { return [] },
        },
        'title': {
            'type': String,
            'required': true,
        },
        'width': {
            'type': String,
            'default': '100%'
        },
    },
    'computed': {
        'previewChartStyle': function() {
            return this.proportionalHeight + ' width: ' + this.width
        },
        'dialogChartStyle': function() {
            // TODO: this is a bit rubbish!
            const width = window.innerWidth
            const height = window.innerHeight
            const style = 'width: ' + (width - width / 10) +
                'px; height: ' + (height - height / 5) + 'px;'
            return style
        },
    },
    'methods': {
        'select': function(selection) {
            const first = selection.points[0]
            const simplified = {
                'chart': this,
                'point': first.pointIndex,
                'x': first.x,
                'y': first.y,
            }
            this.$emit('select', simplified);
        },
        'close': function() {
            this.$refs.dialog.close()
        },
    },
}
</script>

<style scoped>
.preview-chart {
    overflow: hidden;
    width: 100%;
    height: 100%;
}
</style>
