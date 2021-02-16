
<!--
Component that renders a plate based on a passed geometry
Tries to be as data agnostic as possible
Plates are 2D grids of sample holders CrystalQuickX, Mitegen etc.
A plate has a number of drops grouped together. Each drop location holds a sample.

OnClickEvent will only fire if there is data bound to the element with a valid LOCATION property
TODO - move the score colour methods to a utility class
-->
<template>
  <div class="tw-w-full tw-flex tw-flex-col">
    <div class="tw-flex tw-w-full">
      <button-component
        @perform-button-action="toggleSelectionState"
        class="tw-border-gray-500 tw-bg-gray-500 hover:tw-bg-gray-400 tw-bottom-0 tw-right-0 tw-text-gray-900"
      >
        {{ nextFilterState }}
      </button-component>
    </div>
    <div id="plate" class="tw-w-full"></div>
  </div>
</template>

<script>
import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection'
import { scaleSequential as d3ScaleSequential } from 'd3-scale'
import { scaleOrdinal as d3ScaleOrdinal } from 'd3-scale'

import ButtonComponent from 'app/components/utils/ButtonComponent.vue'


export default {
  name: 'PlateView',
  components: {
    'button-component': ButtonComponent
  },
  props: {
    container: {
      type: Object,
      required: true
    },
    samples: {
      type: Array,
      required: true
    },
    selectedDrops: {
      type: Array,
      required: false
    },
    sampleKey: {
      type: String,
      required: false,
    },
    colorRange: {
      type: Array,
      default: () => ([])
    },
    scoreThreshold: {
      type: Number
    }
  },
  data: function () {
    return {
      cell: {
        width: 60,
        height: 60,
        padding: 4,
        margin: 10,
      },
      graphic: null,
      nextFilterState: '',
      allDropsSelected: false,
      currentSelectedDropIndex: -1
    }
  },
  computed: {
    // Made this a computed property to handle case where container.well is null or -1 => no drops used as well/buffer
    // If an actual value provided then use that as the index
    wellIndex: function () {
      if (this.container.well == null) return -1
      else return this.container.well
    },
    dropsPerWell: function () {
      // Take into account any well/buffer location that is not a sample drop
      // Assumption is only one 'drop' location is used as buffer
      // So there will either be 1 or 0 locations we need to ignore
      let wellDropCount = this.wellIndex < 0 ? 0 : 1

      return (this.container.drops.x * this.container.drops.y) - wellDropCount
    },
    dropWidth: function () {
      return this.cell.width / this.container.drops.x
    },
    dropHeight: function () {
      return this.cell.height / this.container.drops.y
    },
    dropCoords: function () {
      // Build up coordinates for each drop based on the geometry
      // Will include an array of objects with x, y parameters
      let drops = []
      let dropIndex = 0

      // Note we iterate over y direction first so drops read left-right, top-bottom
      for (let j = 0; j < this.container.drops.y; ++j) {
        for (let i = 0; i < this.container.drops.x; ++i) {
          if (dropIndex != this.wellIndex) {
            drops.push({
              x: this.cell.padding + this.dropWidth * i,
              y: this.cell.padding + this.dropHeight * j,
            })
          }
          dropIndex += 1
        }
      }
      return drops
    },
    columnLabels: function () {
      return Array.from({ length: this.container.columns }, (v, i) => i + 1)
    },
    columnDomain: function () {
      return Array.from({ length: this.container.columns }, (v, i) => i)
    },
    preparedData: function () {
      if (this.container.capacity <= 0) return [[]]
      // Firstly create an array of length == capacity of container
      let samples = Array.from({ length: this.container.capacity }, () => ({}))

      // Now fill in location with sample data at that location
      for (var i = 0; i < this.samples.length; i++) {
        let location = this.samples[i].LOCATION || null
        // Not quite right - need to add as an array for consistency
        if (location) samples[location - 1] = this.samples[i]
      }

      // Chop up the list of 'samples' at each location into rows/wells
      // [ A [ 1 [1,2], 2 [3,4], ... ], B [ 1 [ 5,6 ], 2 [7,8], ...] ]

      // First parse into an array of wells
      var wells = []
      while (samples.length) {
        wells.push(samples.splice(0, this.dropsPerWell))
      }

      let chunked_rows = []
      while (wells.length) {
        chunked_rows.push(wells.splice(0, this.container.columns))
      }

      return chunked_rows
    },
  },
  watch: {
    selectedDrops() {
      this.updateSelectedDrops()
    },
    colorRange() {
      d3SelectAll("#plate > *").remove()
      this.drawContainer()
    },
    scoreThreshold() {
      d3SelectAll("#plate > *").remove()
      this.drawContainer()
    }
  },
  created() {
    this.nextFilterState = 'Select All Drops'
  },
  mounted () {
    this.drawContainer()
    this.updateLabels()
  },
  methods: {
    drawContainer () {
      let self = this
      // Standard practice for d3 chart is to define margin, then define graphic/chart area inset from main svg
      // This allows room for axes labels etc.
      const margin = { top: 40, left: 40, bottom: 20, right: 20 }

      const numColumns = this.preparedData[0].length || 0
      const numRows = this.preparedData.length || 0

      const viewBoxWidth =
        numColumns *
        (this.cell.width + 2 * this.cell.padding + 2 * this.cell.margin) +
        margin.left +
        margin.right
      const viewBoxHeight =
        numRows *
        (this.cell.height + 2 * this.cell.padding + 2 * this.cell.margin) +
        margin.top +
        margin.bottom

      const viewBox = [0, 0, viewBoxWidth, viewBoxHeight]

      // Make the svg fit within a viewport
      const svg = d3Select('#plate')
        .append('svg')
        .attr('viewBox', viewBox.join(','))
        .attr('preserveAspectRatio', 'xMaxYMax meet')

      svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top - 5})`)
        .selectAll('text')
        .data(this.columnLabels)
        .enter()
        .append('text')
        .attr('x',
          (d, i) =>
            (this.cell.width + 2 * this.cell.padding + this.cell.margin) * i +
            0.5 * this.cell.width
        )
        .attr('class', (d, index) => `plate-column-${index + 1}-header pointer`)
        .style('fill', 'black')
        .style('pointer-events', 'visible')
        .text((d) => d)
        .on('click', (event, index) => {
          console.log({ index });
          const isColumnSelected = event.target.classList.contains('all-column-selection')
          const isPartiallySelected = event.target.classList.contains('partial-column-selection')
          let selectedColumn = [];

          if (this.currentSelectedDropIndex > -1 && !isColumnSelected) {
            selectedColumn = d3SelectAll(`.plate-column-${index} .well-drop-${this.currentSelectedDropIndex} `)
          }
          else {
            selectedColumn = d3SelectAll(`.plate-column-${index} .drop`)
          }

          let columnItemsWithSample = []

          selectedColumn.each((drop) => {
            if (drop.LOCATION) {
              columnItemsWithSample.push(Number(drop.LOCATION))
            }
          })

          if (isColumnSelected) {
            self.$emit('unselect-cell', columnItemsWithSample)
            event.target.classList.remove('all-column-selection')
          }
          else if (!isPartiallySelected) {
            self.$emit('cell-clicked', columnItemsWithSample)
            event.target.classList.add('partial-column-selection')
          }
          else if (isPartiallySelected) {
            self.$emit('cell-clicked', columnItemsWithSample)
          }
        })

      // Row labels scale - maps numbers to letters
      let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

      let rowDomain = Array.from({ length: letters.length }, (v, i) => i)
      let rowLabels = Array.from({ length: letters.length }, (v, i) => letters.charAt(i))

      let letterScale = d3ScaleOrdinal().domain(rowDomain).range(rowLabels)

      // Row labels e.g. A..H
      const row_axis = svg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left - margin.left / 2}, ${
            margin.top + margin.top / 2
          })`
        )
        .selectAll('text')
        .data(this.preparedData)
        .enter()
        .append('text')
        .attr('y',(d, i) => (this.cell.height + 2 * this.cell.padding + this.cell.margin) * i + 0.5 * this.cell.height)
        .attr('class', (d, index) => `plate-row-${index + 1}-header pointer`)
        .style('fill', 'black')
        .style('pointer-events', 'visible')
        .text((d, i) => letterScale(i))

      row_axis.each(function (item, index) {
        d3Select(this).on('click', (event) => {
          const isRowSelected = event.target.classList.contains('all-row-selected')
          const isPartiallySelected = event.target.classList.contains('partial-column-selection')
          let selectedRow = []
          let rowItemWithSample = []

          if (this.currentSelectedDropIndex > -1 && !isRowSelected) {
            selectedRow = d3SelectAll(`.plate-row-${index + 1} .well-drop-${this.currentSelectedDropIndex} `)
          }
          else {
            selectedRow = d3SelectAll(`.plate-row-${index + 1} .drop`)
          }

          selectedRow.each(drop => {
            if (drop.LOCATION) {
              rowItemWithSample.push(Number(drop.LOCATION))
            }
          })

          if (isRowSelected) {
            self.$emit('unselect-cell', rowItemWithSample)
            event.target.classList.remove('all-row-selection')
          }
          else if (!isPartiallySelected) {
            self.$emit('cell-clicked', rowItemWithSample)
            event.target.classList.add('partial-column-selection')
          }
          else if (isPartiallySelected) {
            self.$emit('cell-clicked', rowItemWithSample)
          }
        })
      })

      this.graphic = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      this.drawRowsForPlate(this.graphic)
    },
    drawRowsForPlate(graphic) {
      let self = this

      let rows = graphic.selectAll('.container-row')
        .data(this.preparedData)
        .enter()
        .append('g')
        .attr('class', (d, i) => (`container-row plate-row-${i + 1}`))
        .attr('transform', (d,i) => (`translate(0, ${(this.cell.height + (2 * this.cell.padding) + this.cell.margin) * i} )`))
          
      rows.each(function(d, i) {
        d3Select(this).selectAll('.container-cell')
        .data(d)
        .enter()
        .append('g')
        .attr('class', (cell, index) => (`container-cell plate-row-${i + 1} plate-column-${index + 1}`))
        .attr('transform', (d,i) => (`translate(${(self.cell.width + (2 * self.cell.padding) + self.cell.margin) * i}, 0)`))
        .call(self.drawDropsForWell, i)
      })
    },
    drawDropsForWell(selection) {
      let self = this

      selection
        .append('rect')
        .attr('class', 'container-well')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.cell.width + 2 * this.cell.padding)
        .attr('height', this.cell.height + 2 * this.cell.padding)
        .style('stroke', 'black')
        .style('fill', 'none')
        .style('fill-opacity', '0.2')

      selection
        .append('g')
        .attr('class', 'drops')
        .each(function (d) {
          d3Select(this)
            .selectAll('.drop')
            .data(d)
            .enter()
            .append('rect')
              .attr('class', (d, i) => (d && d.LOCATION ? `pointer drop well-drop-${i + 1}` : `drop well-drop-${i + 1}`))
              .attr('x', (_, i) => self.dropCoords[i].x)
              .attr('y', (_, i) => self.dropCoords[i].y)
              .attr('width', self.dropWidth * self.container.drops.w)
              .attr('height', self.dropHeight * self.container.drops.h)
              .attr('drop-index', (_, i) => i + 1)
              .style('stroke', 'gray')
              .style('fill', (d) => d.LOCATION ? self.calculateColorFromScheme(d.SCORE) : 'none')
              .style('pointer-events', 'visible')
              .on('click', function (event) {
                let sampleCellLocation = d3Select(this).data()[0].LOCATION
          
                if (typeof sampleCellLocation == 'undefined') return

                if (self.selectedDrops.includes(Number(sampleCellLocation))) {
                  self.$emit('unselect-cell', [Number(sampleCellLocation)])
                  self.currentSelectedDropIndex = -1
                }
                else {
                  self.currentSelectedDropIndex = Number(event.target.attributes['drop-index'].value)
                  self.$emit('cell-clicked', [Number(sampleCellLocation)])
                }
              })

          d3Select(this)
            .selectAll('text')
            .data(d)
            .enter()
            .append('text')
            .attr('x', (d, i) => (self.dropCoords[i].x + self.dropWidth * 0.5 * self.container.drops.w))
            .attr('y', (d, i) => (self.dropCoords[i].y + self.dropHeight * 0.5 * self.container.drops.h))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '10px')
            .style('fill', 'darkgray')
            .style('pointer-events', 'none') // Required to capture mouse events on non-fill shapes
        })
    },
    updateLabels: function () {
      this.graphic.selectAll('.cell-labels').html((d, i) => {
        return this.getSampleKey(d, i)
      })
    },
    getSampleKey: function (d, index) {
      if (!this.sampleKey) return index + 1
      else {
        return d[this.sampleKey] || null
      }
    },
    updateSelectedDrops: function () {
      this.graphic
        .selectAll('.drop')
        .style('stroke', d => {
          return d.LOCATION && this.selectedDrops.includes(Number(d.LOCATION)) ? 'steelblue' : 'gray'
        })
        .style('stroke-width', d => {
          return d.LOCATION && this.selectedDrops.includes(Number(d.LOCATION)) ? 2 : 1
        })
    },
    calculateColorFromScheme(value) {
      const domainValues = this.scoreThreshold > 0 
        ? [0, this.scoreThreshold, d3.max(this.samples, d => d.SCORE)]
        : [0, d3.max(this.samples, d => d.SCORE)]

      const setColor =  d3ScaleSequential()
        .domain(domainValues)
        .range(this.colorRange)

      return setColor(value)
    },
    toggleSelectionState() {
      const allSamples = this.samples.map(sample => sample.LOCATION)

      if (this.allDropsSelected) {
        this.$emit('unselect-cell', allSamples)
      } else {
        this.$emit('cell-clicked', allSamples)
      }
      
      this.allDropsSelected = !this.allDropsSelected
      this.$nextTick(() => {
        this.updateSelectedDrops()
      })
      this.nextFilterState = this.allDropsSelected ? 'Deselect All Drops' : 'Select All Drops'

    }
  },
}
</script>
<style>
.pointer {
  cursor: pointer
}
</style>