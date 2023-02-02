<!--
Component that renders a plate based on a passed geometry
Tries to be as data agnostic as possible
Plates are 2D grids of sample holders CrystalQuickX, Mitegen etc.
A plate has a number of drops grouped together. Each drop location holds a sample.
OnClickEvent will only fire if there is data bound to the element with a valid LOCATION property
TODO - move the score colour methods to a utility class
-->
<template>
  <div>
    <div v-if="displayHelpMessage" class="tw-w-full">
      <p class="tw-text-xs tw-mb-3">Click on label button to select drops for that label.</p>
      <p class="tw-text-xs tw-mb-3">Selecting individual drop will change label selection behaviour to select matching drop in that label.</p>

      <p class="tw-text-sm tw-mb-3"> Selecting {{ getSelectedDropPosition(currentSelectedDropIndex) }} Drops </p>
      <base-button @perform-button-action="toggleSelectionState" class="button tw-mb-2">{{ nextFilterState }}</base-button>
    </div>
    <div :id="plateId" class="tw-w-full"></div>
  </div>
</template>

<script>
import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection'
import { scaleLinear as d3ScaleLinear} from 'd3-scale'
import { scaleThreshold as d3ScaleThreshold} from 'd3-scale'
import { scaleOrdinal as d3ScaleOrdinal} from 'd3-scale'
import { interpolateViridis as d3InterpolateViridis} from 'd3-scale-chromatic'
import BaseButton from 'app/components/base-button.vue'
export default {
  name: 'plate-view',
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
      required: true,
      default: () => ([])
    },
    selectedDrops: {
      type: Array,
      default: () => ([])
    },
    sampleKey: {
      type: String,
      required: false,
    },
    colorScale: {
      type: String,
      default: 'rgb'
    },
    colorAttribute: {
      type: String,
      default: 'SCORE',
      required: true
    },
    scoreThreshold: {
      type: Number
    },
    strokeColor: {
      type: String,
      default: 'black'
    },
    plateId: {
      type: String,
      default: 'plate'
    },
    selectedSamples: {
      type: Array,
      default: () => ([])
    },
    addedColorAttribute: {
      type: String,
      default: ''
    },
    threshold: {
      type: Number,
      default: 0.5
    }
  },
  data() {
    return {
      cell: {
        width: 60,
        height: 60,
        padding: 4,
        margin: 10,
      },
      graphic: null,
      currentSelectedDropIndex: -1,
      plateSvg: null,
      plateMargin: { top: 40, left: 40, bottom: 20, right: 20 },
      rowLetters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      nextFilterState: 'Select All Drops',
      allDropsSelected: false
    }
  },
  computed: {
    // Made this a computed property to handle case where container.well is null or -1 => no drops used as well/buffer
    // If an actual value provided then use that as the index
    wellIndex() {
      if (this.container.well == null) return -1
      else return this.container.well
    },
    dropsPerWell() {
      // Take into account any well/buffer location that is not a sample drop
      // Assumption is only one 'drop' location is used as buffer
      // So there will either be 1 or 0 locations we need to ignore
      let wellDropCount = this.wellIndex < 0 ? 0 : 1
      return (this.container.drops.x * this.container.drops.y) - wellDropCount
    },
    dropWidth() {
      return this.cell.width / this.container.drops.x
    },
    dropHeight() {
      return this.cell.height / this.container.drops.y
    },
    dropCoords() {
      // Build up coordinates for each drop based on the geometry
      // Will include an array of objects with x, y parameters
      let drops = []
      let dropIndex = 0
      // Note we iterate over y direction first so drops read left-right, top-bottom
      for (let j = 0; j < this.container.drops.y; ++j) {
        for (let i = 0; i < this.container.drops.x; ++i) {
          if (dropIndex !== this.wellIndex) {
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
    columnLabels() {
      return Array.from({ length: this.container.columns }, (v, i) => i + 1)
    },
    columnDomain() {
      return Array.from({ length: this.container.columns }, (v, i) => i)
    },
    preparedData() {
      if (this.container.capacity <= 0) return ([])
      // Firstly create an array of length == capacity of container
      let samples = Array.from({ length: this.container.capacity }, (_, i) => ({ LOCATION: i + 1 }))
      // Now fill in location with sample data at that location
      for (let i = 0; i < this.samples.length; i++) {
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
      const wells = []
      while (samples.length) {
        wells.push(samples.splice(0, this.dropsPerWell))
      }
      const chunked_rows = []
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
      return Array.from({ length: this.rowLetters.length }, (v, i) => i)
    },
    displayHelpMessage() {
      return this.$displayHelpMessage
    },
    labelAsButtons() {
      return this.$labelAsButtons
    },
    displayTextInDrop() {
      return this.$displayTextInDrop
    }
  },
  watch: {
    selectedDrops() {
      this.updateSelectedDrops()
    },
    scoreThreshold() {
      d3SelectAll(`#${this.plateId} > *`).remove()
      this.drawContainer()
    },
    samples() {
      this.allDropsSelected = false
      d3SelectAll(`#${this.plateId} > *`).remove()
      this.drawContainer()
      this.updateSelectedDrops()
      this.currentSelectedDropIndex = -1
    },
    currentSelectedDropIndex(newVal) {
      this.getSelectedDropPosition(newVal)
    },
  },
  mounted () {
    this.drawContainer()
    this.updateLabels()
    this.updateSelectedDrops()
  },
  methods: {
    drawContainer () {
      // Standard practice for d3 chart is to define margin, then define graphic/chart area inset from main svg
      // This allows room for axes labels etc.
      const numColumns = this.preparedData[0].length || 0
      const numRows = this.preparedData.length || 0
      const viewBoxWidth =
          (numColumns * (this.cell.width + 2 * this.cell.margin)) + this.plateMargin.left + this.plateMargin.right
      const viewBoxHeight =
          (numRows * (this.cell.height + 2 * this.cell.margin)) + this.plateMargin.top + this.plateMargin.bottom
      const viewBox = [0, 0, viewBoxWidth, viewBoxHeight]
      this.plateSvg = d3Select(`#${this.plateId}`)
        .append('svg')
        .attr('viewBox', viewBox.join(','))
        .attr('preserveAspectRatio', 'xMinYMin meet')
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
            .style('stroke', self.strokeColor)
            .style('fill', 'none')
            .style('pointer-events', 'visible')
            .on('click', (event, data) => {
              const classList = [...event.target.classList.values()]
              const wellDropClass = classList.find(classItem => classItem.includes('well-drop'))
              const [wellDrop] = wellDropClass.match(/\d+$/)
              return self.handleDropSelection(event.target, {...data, wellDrop, index: data.dropIndex }, null)
            })

          if (self.displayTextInDrop) {
            d3Select(this).selectAll('text')
              .data(d)
              .enter()
              .append('text')
              .attr('class', 'cell-labels')
              .attr('x', (d,i) => { return self.dropCoords[i].x + self.dropWidth*0.5*self.container.drops.w })
              .attr('y', (d,i) => { return self.dropCoords[i].y + self.dropHeight*0.5*self.container.drops.h })
              // .html((d) => { return d.SCORE ? d3.format(".1f")(d.SCORE) : ''})
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .style('font-size', '10px')
              .style('fill', 'darkgray')
              .style("pointer-events","none") // Required to capture mouse events on non-fill shapes
          }
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
        .style('fill', d => this.scoreColors(d))
        .style('stroke-width', d => d.LOCATION && this.selectedDrops.includes(Number(d.LOCATION)) ? 2 : 1)
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
    handleDropSelection(target, data, type) {
      const { wellDrop, index, LOCATION } = data
      if (!type) {
        this.$emit('drop-clicked', { location: LOCATION, index: wellDrop })
      }

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
      } else {
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
      if (tenthRemainder === 1 && hundredthRemainder !== 11) {
        return `${number}st`
      }
      else if (tenthRemainder === 2 && hundredthRemainder !== 12) {
        return `${number}nd`
      }
      else if (tenthRemainder === 3 && hundredthRemainder !== 13) {
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
      // Row labels e.g. A..H
      this.plateSvg
          .append('g')
          .attr(
            'transform',
            `translate(${0}, ${this.plateMargin.top + this.plateMargin.top / 2})`
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
          .text((d, i) => this.letterScale(i))
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
          .on('click', (event, index) => self.handleDropSelection(event.target, { index }, 'column'))
          .attr('transform', (_, i) => `translate(${(this.cell.width + 2 * this.cell.padding + this.cell.margin) * i}, -30)`)
          .each(function() {
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
      const self = this
      // Row labels e.g. A..H
      const row_axis = this.plateSvg
          .append('g')
          .attr(
            'transform',
            `translate(${0}, ${this.plateMargin.top})`
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
            .text(() => self.letterScale(index))
        d3Select(this).on('click', (event) => self.handleDropSelection(event.target, {index: index +1 }, 'row'))
      })
    },
    scoreColors: function(d) {
      let scale
      let score
      let colorScale = this.colorScale
      const selectedSample = this.selectedSamples.find(sample => Number(sample['LOCATION']) === Number(d.LOCATION))

      if (selectedSample && selectedSample[this.colorAttribute]) {
        score = selectedSample[this.colorAttribute]
      } else if (selectedSample && this.addedColorAttribute && selectedSample[this.addedColorAttribute]) {
        colorScale = 'threshold'
        score = selectedSample[this.addedColorAttribute]
      } else if (!selectedSample && d[this.colorAttribute]) {
        score = d[this.colorAttribute]
      } else {
        score = null
      }

      switch(colorScale) {
        case 'rgb':
          scale = this.rgbScale()
          break
        case 'viridis':
          scale = d3InterpolateViridis
          break
        case 'threshold':
          scale = this.quantScale(this.threshold)
          break
        default:
          scale = this.rgbScale()
          break
      }
      if (score) return scale(score)
      else return 'none'
    },
    quantScale: function(threshold) {
      return  d3ScaleThreshold()
          .domain([0,threshold, 1])
          .range(["lightgray", "lightblue", "lightblue"])
    },
    rgbScale: function() {
      // Option 1: give 2 color names
      return d3ScaleLinear()
          .domain([0,1])
          .range(["red", "green"])
    },
  },
  inject: [
    '$displayHelpMessage',
    '$labelAsButtons',
    '$displayTextInDrop'
  ]
}
</script>
<style>
.pointer {
  cursor: pointer
}
</style>