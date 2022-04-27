<template>
  <div id="distl" :style="{'height': '250px' }"></div>
</template>
<script>
export default {
  name: 'data-collection-distl-view',
  props: {
    numberOfImage: {
      type: [null, Number]
    },
    si: {
      type: Number
    },
    chartData: {
      type: Array
    },
    axisRange: {
      type: Number
    },
    axisStart: {
      type: Number
    },
    selection: {
      type: Boolean
    },
    clickable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      hidden: 'Total',
      plot: null
    }
  },
  mounted() {
    this.plot = $.plot($('#distl'), this.plotData, this.plotOptions)
  },
  methods: {
    renderPlot() {
      $.plot($('#stack-placeholder'), this.plotData, this.plotOptions)
    },
    plotSelected(e, pos, item) {
      if (item && item.datapoint.length) {
        this.$emit('plot:click', item.datapoint[0], item.datapoint[1])
      }
    },
    plotUnselected(e, ranges) {
      this.$emit('plot:select', Math.floor(ranges.xaxis.from), Math.ceil(ranges.xaxis.to))
    },
    plotClick() {
      this.$emit('plot:deselect')
    },
    setSelection() {
      this.plot.set
    }
  },
  computed: {
    plotOptions() {
      const options = {
        grid: {
          borderWidth: 0,
          clickable: this.clickable,
          hoverable: this.clickable,
        },
        series: {
          points: {
            show: true,
            radius: 1,
          }
        },
        xaxis: {
          minTickSize: 1,
          tickDecimals: 0,
        },
        yaxes: [{}, { position: 'right', transform: function (v) { return -v; } }, { ticks: [] }],
      }

      if (this.numberOfImage) {
        options.xaxes = [{ max: this.numberOfImage + this.si - 1 }, { position: 'top' }]
      }

      if (this.selection) {
        options.selection = { mode: 'x' }
      }

      return options
    },
    plotData() {
      const objectData = { 'Spots': [0, 1], 'Bragg': [1, 1], 'Res': [2, 2], 'Total': [3, 4] }
      const data = []

      Object.keys(objectData).forEach(key => {
        const [value, yAxis] = objectData[key]
        if (this.chartData[value].length && this.chartData[value][0][1] && this.hidden !== key) {
          data.push({ data: this.chartData[value], label: key, yaxis: yAxis })
        }
      })

      if (this.numberOfImage) {
        const osc = []

        this.chartData[0].forEach(item => {
          const firstIndexItem = (item[0] - this.si ) * this.axisRange + this.axisStart
          osc.push([firstIndexItem, 0])
        })

        data.push({ data: osc, yaxis: 3, xaxis: 2, points: { show: false }, lines: { show: false } })
      }

      return data
    },
    chartHeight() {
      // const width = 0.175 * $(window).width() * 0.95
      // return $(window).width() > 1280 ? width : ($(window).width() > 800 ? width * 1.3 : ( width * 1.65))
      return 500
    }
  },
  beforeDestroy() {
    this.plot.shutdown()
  }
}
</script>
<style></style>