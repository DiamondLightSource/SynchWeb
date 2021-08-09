<template>
  <div :style="previewStyle">
    <dialog-modal
      :is-active="showDialog"
      :title="title"
      @cancel="showDialog = false"
    >
      <template #contents>
        <plotly-chart
          :style="bigChartStyle"
          :title="title"
          :layout="layout"
          :chart-data="chartData"
        />
      </template>
    </dialog-modal>

    <plotly-chart
      class="main-screen-preview"
      static
      :title="title"
      :layout="layout"
      :chart-data="chartData"
      @click="showDialog = true"
    />
  </div>
</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'
import PlotlyChart from 'app/components/plotly-chart.vue'
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': 'DialogPlotly',
    'components': {
        'dialog-modal': DialogModal,
        'plotly-chart': PlotlyChart,
    },
    'mixins': [proportionalHeight],
    'props': {
        'isActive': {
            'type': Boolean,
            'default': false,
        },
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
        'width': {
            'type': String,
            'default': '400px'
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
            const width = window.innerWidth
            const height = window.innerHeight
            const style = 'width: ' + (width - width / 10) +
                'px; height: ' + (height - height / 5) + 'px;'
            return style
        },
    },
}
</script>

<style>
.main-screen-preview {
    overflow: hidden;
    border-radius: 6px;
    width: 100%;
    height: 100%;
}
</style>
