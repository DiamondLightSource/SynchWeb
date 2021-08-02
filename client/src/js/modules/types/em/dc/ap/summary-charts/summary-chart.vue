<template>
  <chart
    :options="chartOptions"
    :plot-data="plotData"
    width="30%"
  />
</template>

<script>
import summaryOptions from 'modules/types/em/dc/ap/summary-charts/chart-options'
import Chart from 'modules/types/em/components/chart.vue'

export default {
    'name': "SummaryChart",
    'components': {
        'chart': Chart,
    },
    'props': {
        'plotData': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'chartOptions': summaryOptions,
        }
    },
}
</script>
