<template>
  <div>
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
      :style="proportionalHeight"
      :title="titleText"
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
            'type': Object,
            'required': true,
        },
        'title': {
            'type': String,
            'required': true,
        },
    },
    'data': function () {
        return {
            'showDialog': false,
        }
    },
    'computed': {
        'bigChartStyle': function() {
            return 'width: 900px;'
        },
    },
}
</script>

<style>
.main-screen-preview {
    overflow: hidden;
    width: 400px;
    border-radius: 6px;
}
</style>
