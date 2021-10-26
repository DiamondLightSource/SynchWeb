<template>
  <div>
    <dialog-modal
      v-if="showDialog"
      :show-dialog="showDialog"
      :title="title"
      @cancel="showDialog = false"
    >
      <plotly-chart
        class="dialog-chart"
        :title="title"
        :layout="layout"
        :chart-data="chartData"
        :annotations="annotations"
        @select="select"
      />
    </dialog-modal>

    <div
      class="preview-container"
      :title="previewHint"
      @click="showDialog = true"
    >
      <!-- v-html is only needed to support current version of ice-breaker.
           When ice-breaker is moved to ISpyB and is plotted locally,
           we can do without v-html -->
      <div
        class="preview-heading"
        v-html="title"
      />
      <plotly-chart
        class="preview-chart"
        static
        :layout="layout"
        :chart-data="chartData"
        :annotations="annotations"
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

export default {
    'name': 'DialogPlotly',
    'components': {
        'dialog-modal': DialogModal,
        'plotly-chart': PlotlyChart,
    },
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
    },
    'data': function() {
        return {
            'showDialog': false,
            'originalRange': null,
        }
    },
    'computed': {
        'previewHint': function() {
            return 'Click to view ' + this.title
        },
    },
    'watch': {
        'showDialog': function(newValue, oldValue) {
            if (newValue) {
                this.originalRange = this.layout.xaxis.range
            } else {
                this.layout.xaxis.range = this.originalRange
            }
        },
    },
    'methods': {
        'close': function() {
            // see modules/types/em/ctf-summary/summary-charts.vue::select
            this.showDialog = false
        },
        'select': function(selection) {
            const first = selection.points[0]
            this.$emit('select', {
                'chart': this,
                'point': first.pointIndex,
                'text': first.text,
                'x': first.x,
                'y': first.y,
            });
        },
    },
}
</script>

<style scoped>
.preview-heading {
    text-align: center;
    font-weight: bold;
    margin-bottom: 5px;
}
.preview-container {
    background-color: #fff;
    padding: 5px;
    border-radius: 6px;
}
.preview-chart {
    overflow: hidden;
    width: 100%;
    height: 14vw;
    @media (max-width: 800px) {
        height: 11vw;
    }
    @media (max-width: 1280px) {
        height: 9vw;
    }
}
.dialog-chart {
    width: 90vw;
    height: 80vh;
}
</style>
