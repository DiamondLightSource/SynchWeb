
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
    <div class="tw-flex tw-w-full tw-items-center tw-justify-between">
      <p class="tw-text-lg">
        Click on Row/Column to select {{ getSelectedDropPosition(currentSelectedDropIndex) }} drops for the Row/Column
      </p>

      <base-button
        @perform-button-action="toggleSelectionState"
        class="button tw-mr-2"
      >
        {{ nextFilterState }}
      </base-button>
    </div>
    <div id="plate" class="tw-w-full"></div>
  </div>
</template>

<script>
import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection'
import { scaleOrdinal as d3ScaleOrdinal } from 'd3-scale'

import BaseButton from 'app/components/base-button.vue'


export default {
  name: 'PlateView',
  components: {
    'base-button': BaseButton
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
      default: () => ([])
    },
    sampleKey: {
      type: String,
      required: false,
    },
    sampleColour: {
      type: String,
      default: 'gray'
    },
    scoreThreshold: {
      type: Number
    },
    labelAsButtons: {
      type: Boolean,
      default: true
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
      currentSelectedDropIndex: -1,
      plateSvg: null,
      plateMargin: { top: 40, left: 40, bottom: 20, right: 20 },
      rowLetters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
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
      if (this.container.capacity <= 0) return ([])
      // Firstly create an array of length == capacity of container
      let samples = Array.from({ length: this.container.capacity }, () => ({}))

      // Now fill in location with sample data at that location
      for (var i = 0; i < this.samples.length; i++) {
        let location = this.samples[i].LOCATION || null
        // Not quite right - need to add as an array for consistency
        if (location) samples[location - 1] = this.samples[i]
      }

      samples.forEach((sample, index) => {
        sample['dropIndex'] = index + 1
      })

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
    letterScale () {
      return d3ScaleOrdinal().domain(this.rowDomain).range(this.rowLabels)
    },
    rowLabels() {
      return Array.from({ length: this.rowLetters.length }, (v, i) => this.rowLetters.charAt(i))
    },
    rowDomain() {
      Array.from({ length: this.rowLetters.length }, (v, i) => i)
    }
  },
  watch: {
    selectedDrops() {
      this.updateSelectedDrops()
    },
    scoreThreshold() {
      d3SelectAll("#plate > *").remove()
      this.drawContainer()
    },
    samples() {
      this.allDropsSelected = false
      d3SelectAll("#plate > *").remove()
      this.drawContainer()
      this.updateSelectedDrops()
      this.currentSelectedDropIndex = -1
    },
    currentSelectedDropIndex(newVal, oldVal) {
      this.getSelectedDropPosition(newVal)
    }
  },
  created() {
    this.nextFilterState = 'Select All Drops'
  },
  mounted () {
    this.drawContainer()
    this.updateLabels()
    this.updateSelectedDrops()
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
        this.plateMargin.left +
        this.plateMargin.right
      const viewBoxHeight =
        numRows *
        (this.cell.height + 2 * this.cell.padding + 2 * this.cell.margin) +
        this.plateMargin.top +
        this.plateMargin.bottom

      const viewBox = [0, 0, viewBoxWidth, viewBoxHeight]
      this.plateSvg = d3Select('#plate')
        .append('svg')
        .attr('viewBox', viewBox.join(','))
        .attr('preserveAspectRatio', 'xMaxYMax meet')

      if (this.labelAsButtons) {
        this.drawColumnLabelsAsButton()
        this.drawRowLabelsAsButton()
      } else {
        this.drawColumnLabelsAsText()
        this.drawRowLabelsAsText()
      }

      this.graphic = this.plateSvg
        .append('g')
        .attr('transform', `translate(${this.plateMargin.left}, ${this.plateMargin.top})`)

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
              .attr('class', (d, i) => (d && d.LOCATION ? `pointer drop well-drop-${i + 1} drop-index-${d.dropIndex}` : `drop well-drop-${i + 1} drop-index-${d.dropIndex}`))
              .attr('x', (_, i) => self.dropCoords[i].x)
              .attr('y', (_, i) => self.dropCoords[i].y)
              .attr('width', self.dropWidth * self.container.drops.w)
              .attr('height', self.dropHeight * self.container.drops.h)
              .attr('well-drop-index', (_, i) => i + 1)
              .attr('drop-index', (d) => d.dropIndex)
              .style('stroke', 'black')
              .style('fill', (d) => d.LOCATION ? self.sampleColour : 'none')
              .style('pointer-events', 'visible')
              .on('click', (event, data) => self.handleDropSelection(event.target, data.dropIndex, null))
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
          return d.LOCATION && this.selectedDrops.includes(Number(d.LOCATION)) ? 'black' : 'gray'
        })
        .style('stroke-width', d => {
          return d.LOCATION && this.selectedDrops.includes(Number(d.LOCATION)) ? 2 : 1
        })
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
        this.clearHeaders(this.preparedData, 'row')
        this.clearHeaders(this.columnLabels, 'column')
      })
      this.nextFilterState = this.allDropsSelected ? 'Deselect All Drops' : 'Select All Drops'
    },
    clearHeaders(data, type) {
      data.forEach((_, index) => {
        d3Select(`plate-${type}-${index + 1}-header`).classed(`partial-${type}-selection`, false)
        d3Select(`plate-${type}-${index + 1}-header`).classed(`all-${type}-selection`, false)
      })
    },
    /**
     * handles the different states of selecting drop(s) in the plate
     * 1. When a row or column is selected first, we select all drops for that column or row
     * 2. When a drop is clicked, we add the selected drop and also note the index of the drop in the well
     * 3. When a column or row is clicked and a drop index exist, we select all the drop with the same matching index for the row or column
     * 4. When the column or row is clicked again with all the drop index for that row or column selected, we select all the drops for that row or column
     */
    handleDropSelection(target, index, type) {
      const isFullSelection = target.classList.contains(`all-${type}-selection`)
      const isPartialSelection = target.classList.contains(`partial-${type}-selection`)

      let selections = []
      let itemsWithSample = []

      if (type && this.currentSelectedDropIndex > 0 && !isFullSelection) {
        selections = d3SelectAll(`.plate-${type}-${index} .well-drop-${this.currentSelectedDropIndex}`)
      }
      else if (type && this.currentSelectedDropIndex > 0 && isFullSelection) {
        selections = d3SelectAll(`.plate-${type}-${index} .drop`)
      }
      else if (type && this.currentSelectedDropIndex < 1 && !isFullSelection) {
        selections = d3SelectAll(`.plate-${type}-${index} .drop`)
      }
      else if (type && this.currentSelectedDropIndex < 1 && isFullSelection) {
        selections = d3SelectAll(`.plate-${type}-${index} .drop`)
      }
      else {
        selections = d3SelectAll(`.drop-index-${index}`)
        this.currentSelectedDropIndex = Number(target.attributes['well-drop-index'].value)
      }

      selections.each(drop => {
        if (drop.LOCATION) {
          itemsWithSample.push(Number(drop.LOCATION))
        }
      })

      if (itemsWithSample.length < 1) return

      if (type) {
        const allTypeSelected = itemsWithSample.every(drop => this.selectedDrops.includes(drop))
  
        if (isFullSelection) {
          this.$emit('unselect-cell', itemsWithSample)
          target.classList.remove(`all-${type}-selection`, `partial-${type}-selection`)
          this.currentSelectedDropIndex = -1
        }
        else if (!isFullSelection && !isPartialSelection && this.currentSelectedDropIndex < 1) {
          this.$emit('cell-clicked', itemsWithSample)
          target.classList.add(`all-${type}-selection`)
        }
        else if (!isPartialSelection) {
          this.$emit('cell-clicked', itemsWithSample)
          target.classList.add(`partial-${type}-selection`)
        }
        else if (isPartialSelection && allTypeSelected) {
          itemsWithSample = []
          selections = d3SelectAll(`.plate-${type}-${index} .drop`).each(drop => {
            if (drop.LOCATION) {
              itemsWithSample.push(Number(drop.LOCATION))
            }
          })
          this.$emit('cell-clicked', itemsWithSample)
          target.classList.remove(`partial-${type}-selection`)
          target.classList.add(`all-${type}-selection`)
        }
        else if (isPartialSelection && !isFullSelection) {
          this.$emit('cell-clicked', itemsWithSample)
        }
      }
      else {
        if (this.selectedDrops.includes(itemsWithSample[0])) {
          this.$emit('unselect-cell', itemsWithSample)
          this.currentSelectedDropIndex = -1
        }
        else {
          this.currentSelectedDropIndex = Number(target.attributes['well-drop-index'].value)
          this.$emit('cell-clicked', itemsWithSample)
        }
      }
    },
    getSelectedDropPosition(number) {
      if (number < 0) return 'All'

      const tenthRemainder = number % 10
      const hundredthRemainder = number % 100

      if (tenthRemainder == 1 && hundredthRemainder != 11) {
        return `${number}st`
      }
      else if (tenthRemainder == 2 && hundredthRemainder != 12) {
        return `${number}nd`
      }
      else if (tenthRemainder == 3 && hundredthRemainder != 13) {
        return `${number}rd`
      }
      return `${number}th`
    },
    drawColumnLabelsAsText() {
      // Draw the columns of the plate
      this.plateSvg
        .append('g')
        .attr('transform', `translate(${this.plateMargin.left}, ${this.plateMargin.top - 5})`)
        .selectAll('text')
        .data(this.columnLabels)
        .enter()
        .append('text')
        .attr('x',
          (d, i) =>
            (this.cell.width + 2 * this.cell.padding + this.cell.margin) * i + 0.5 * this.cell.width
        )
        .attr('class', (d, index) => `plate-column-${index + 1}-header`)
        .style('fill', 'black')
        .style('pointer-events', 'visible')
        .style('font-size', '16px')
        .text((d) => d)
    },
    drawRowLabelsAsText() {
      // Row labels scale - maps numbers to letters
      let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

      let rowDomain = Array.from({ length: letters.length }, (v, i) => i)
      let rowLabels = Array.from({ length: letters.length }, (v, i) => letters.charAt(i))

      let letterScale = d3ScaleOrdinal().domain(rowDomain).range(rowLabels)

      // Row labels e.g. A..H
      this.plateSvg
        .append('g')
        .attr(
          'transform',
          `translate(${0}, ${
            this.plateMargin.top + this.plateMargin.top / 2
          })`
        )
        .selectAll('text')
        .data(this.preparedData)
        .enter()
        .append('text')
        .attr('y',(d, i) => (this.cell.height + 2 * this.cell.padding + this.cell.margin) * i)
        .attr('class', (d, index) => `plate-row-${index + 1}-header`)
        .style('fill', 'black')
        .style('pointer-events', 'visible')
        .style('font-size', '16px')
        .text((d, i) => letterScale(i))
    },
    drawColumnLabelsAsButton() {
      // Draw the columns of the plate
      const self = this
      this.plateSvg
        .append('g')
          .attr('transform', `translate(${this.plateMargin.left}, ${this.plateMargin.top - 5})`)
          .selectAll('rect')
          .data(this.columnLabels)
          .enter()
          .append('g')
          .attr('class', (d, index) => `plate-column-${index + 1}-header pointer`)
          .on('click', (event, index) => self.handleDropSelection(event.target, index, 'column'))
          .attr('transform', (_, i) => `translate(${(this.cell.width + 2 * this.cell.padding + this.cell.margin) * i}, -30)`)
          .each(function(d, i) {
            d3Select(this)
              .append('foreignObject')
              .attr('width', (self.cell.width + self.cell.margin))
              .attr('height', 30)
              .attr('x', (_, i) =>
                (self.cell.width + 2 * self.cell.padding + self.cell.margin) * i)
              .append('xhtml:div')
              .style('width', '100%')
              .style('height', '100%')
              .append('button')
              .attr('class', 'button pointer')
              .style('width', '100%')
              .style('height', '100%')
              
            d3Select(this)
              .append('text')
              .attr('x', (d, i) => (self.cell.width + 2 * self.cell.padding + self.cell.margin) * i + 0.5 * self.cell.width)
              .attr('y', self.dropHeight / 3)
              .attr('width', (self.cell.width + self.cell.margin))
              .attr('height', self.dropHeight,)
              .style('font-size', '16px')
              .style('cursor', 'pointer')
              .style('fill', 'black')
              .text((d) => d)
          })
        
    },
    drawRowLabelsAsButton() {
      let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

      let rowDomain = Array.from({ length: letters.length }, (v, i) => i)
      let rowLabels = Array.from({ length: letters.length }, (v, i) => letters.charAt(i))

      let letterScale = d3ScaleOrdinal().domain(rowDomain).range(rowLabels)
      const self = this

      // Row labels e.g. A..H
      const row_axis = this.plateSvg
        .append('g')
        .attr(
          'transform',
          `translate(${0}, ${
            this.plateMargin.top
          })`
        )
        .selectAll('rect')
        .data(this.preparedData)
        .enter()
        .append('g')
        .attr('transform', (_, i) => `translate(${0}, ${(this.cell.height + 2 * this.cell.padding + this.cell.margin) * i})`)
        .attr('class', (d, index) => `plate-row-${index + 1}-header pointer`)

      row_axis.each(function (item, index) {
        d3Select(this)
          .append('foreignObject')
          .attr('height', (self.cell.height + self.cell.margin))
          .attr('width', 30)
          .attr('y',(d, i) => (self.cell.height + 2 * self.cell.padding + self.cell.margin) * i)
          .append('xhtml:div')
          .style('width', '100%')
          .style('height', '100%')
          .append('button')
          .attr('class', 'button pointer')
          .style('width', '100%')
          .style('height', '100%')
        d3Select(this)
          .append('text')
          .attr('y', (_, i) => (self.cell.height + 2 * self.cell.padding + self.cell.margin) * i + 0.75 * self.cell.height)
          .attr('x', 10)
          .style('font-size', '16px')
          .style('cursor', 'pointer')
          .style('fill', 'black')
          .text(() => letterScale(index))

        d3Select(this).on('click', (event) => self.handleDropSelection(event.target, index + 1, 'row'))
      })
    }
  }
}
</script>
<style>
.pointer {
  cursor: pointer
}
</style>