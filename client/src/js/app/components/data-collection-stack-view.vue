<template>
  <div id="stack-placeholder" style="height:30px"></div>
</template>
<script>
export default {
  name: 'data-collection-stack-view',
  props: {
    modelData: {
      type: Object,
      default: () => ({})
    }
  },
  mounted() {
    this.renderPlot()
  },
  methods: {
    renderPlot() {
      $.plot($('#stack-placeholder'), this.plotData, this.plotOptions)
    },
    getTooltip(lab, x, y, item) {
      return item.series.label+': '+x.toFixed(2)+'hrs'
    }
  },
  computed: {
    plotOptions() {
      return {
        series: {
          bars: {
            horizontal: true,
            show: true,
          },
          stack: true
        },
        tooltip: true,
        tooltipOpts: {
          content: this.getTooltip,
        },
        legend: {
          show: false
        },
        grid: {
          borderWidth: 0,
          hoverable: true,
        },
        yaxis: {
          max: 1,
          ticks: [],
        },
        xaxis: {
          ticks: []//[0,4,8,12,16,20,24]
        },
      }
    },
    plotData() {
      return [
        { label: 'Startup', color: 'yellow', data: [[this.modelData.SUP, 0]] },
        { label: 'Data Collection', color: 'green', data: [[this.modelData.DCTIME, 0]] },
        { label: 'Auto Indexing', color: '#93db70', data: [[this.modelData.AITIME, 0]] },
        { label: 'Centring', color: 'cyan', data: [[this.modelData.CENTTIME, 0]] },
        { label: 'Energy Scans', color: 'orange', data: [[this.modelData.EDGE,0]] },
        { label: 'Robot Actions', color: 'blue', data: [[this.modelData.R, 0]] },
        { label: 'Thinking', color: 'purple', data: [[this.modelData.T, 0]] },
        { label: 'Remaining', color: 'red', data: [[this.modelData.REM, 0]] },
        { label: 'Beam Dump', color: 'black', data: [[this.modelData.NOBEAM, 0]] },
        { label: 'Faults', color: 'grey', data: [[this.modelData.FAULT, 0]] }
      ]
    }
  },
  watch: {
    modelData: {
      deep: true,
      handler: 'renderPlot'
    }
  }
}
</script>
<style></style>