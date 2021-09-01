<template>
  <div>
    <dialog-modal
      :is-active="showDialog"
      :title="title"
      @cancel="close"
    >
      <plotly-chart
        :style="bigChartStyle"
        :title="title"
        :layout="layout"
        :chart-data="chartData"
        :annotations="annotations"
        @select="select"
      />
    </dialog-modal>

    <div class="preview-container">
      <div
        class="chart-heading"
        v-html="title"
      />
      <plotly-chart
        :style="previewStyle"
        class="main-screen-preview"
        static
        :layout="layout"
        :chart-data="chartData"
        :annotations="annotations"
        @click="showDialog = true"
      />
    </div>
  </div>
</template>

<script>
////////////////////////////////////////////////////////////////////
//
// A simple static plotly chart that can be clicked on to open up a
// nearly full screen interactive version in a modal dialog
//
////////////////////////////////////////////////////////////////////

import DialogModal from 'app/components/dialog-modal.vue'
import PlotlyChart from 'app/components/plotly-chart.vue'
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': 'PlotlyDialog',
    'components': {
        'dialog-modal': DialogModal,
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
    'data': function () {
        return {
            'showDialog': false,
        }
    },
    'computed': {
        'previewStyle': function() {
            return this.proportionalHeight + ' width: ' + this.width
        },
        'bigChartStyle': function() {
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
            this.showDialog = false
        },
    },
}
</script>

<style scoped>
.chart-heading {
    text-align: center;
    font-weight: bold;
    margin-bottom: 5px;
}
.preview-container {
    background-color: #fff;
    padding: 5px;
    border-radius: 6px;
}
.main-screen-preview {
    overflow: hidden;
    width: 100%;
    height: 100%;
}
</style>
