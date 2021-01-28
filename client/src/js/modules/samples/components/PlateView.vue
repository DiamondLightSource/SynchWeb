
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
        <p>Container Geometry: {{ JSON.stringify(container) }}</p>
        <div id="plate"></div>
    </div>
</template>

<script>
import { select as d3Select } from 'd3-selection'
import { scaleLinear as d3ScaleLinear} from 'd3-scale'
import { scaleThreshold as d3ScaleThreshold} from 'd3-scale'
import { scaleOrdinal as d3ScaleOrdinal} from 'd3-scale'
import { interpolateViridis as d3InterpolateViridis} from 'd3-scale-chromatic'

export default {
    name: 'Plate-View',
    props: {
      'container': Object, // Plate geometry
      'samples': Array, // Data bound to each cell / drop location
      'selected': {
          type: Array, // list of locations that should be highlighted
          required: false
      },
      label: {
          type: String, // Which key within the sample data should be shown (location index if nothing provided)
          required: false
      },
      'color-scale': String, // color-scale mapped to colorScale prop
      'threshold': Number // Threshold used as part of colorScale
    },
    data: function() {
      return {
        cell: {
          width: 60,
          height: 60,
          padding: 4, // Padding within each cell
          margin: 10, // Spacing between wells in graphic
        },
        graphic: null // Placeholder for main svg graphic area
      }
    },
    computed: {
      // Made this a computed property to handle case where container.well is null or -1 => no drops used as well/buffer
      // If an actual value provided then use that as the index
      wellIndex: function() {
        if (this.container.well == null) return -1
        else return this.container.well
      },
      dropsPerWell: function() {
        // Take into account any well/buffer location that is not a sample drop
        // Assumption is only one 'drop' location is used as buffer
        // So there will either be 1 or 0 locations we need to ignore
        let wellDropCount = this.wellIndex < 0 ? 0 : 1

        let dropsPerWell = (this.container.drops.x * this.container.drops.y) - wellDropCount

        return  dropsPerWell
      },
      dropWidth: function() {
        return this.cell.width / this.container.drops.x
      },
      dropHeight: function() {
        return this.cell.height / this.container.drops.y
      },
      dropCoords: function() {
        // Build up coordinates for each drop based on the geometry
        // Will include an array of objects with x, y parameters
        let drops = []
        let dropIndex = 0;

        // Note we iterate over y direction first so drops read left-right, top-bottom
        for (let j = 0; j<this.container.drops.y; ++j) {
          for (let i = 0; i<this.container.drops.x; ++i) {
            if (dropIndex != this.wellIndex) {
              drops.push({x: this.cell.padding + this.dropWidth*i, y: this.cell.padding + this.dropHeight*j})
            }
            dropIndex += 1
          }
        }
        return drops
      },
      columnLabels: function() {
        let labels = Array.from({length: this.container.columns}, (v, i) => i + 1)
        return labels
      },
      columnDomain: function() {
        let labels = Array.from({length: this.container.columns}, (v, i) => i)
        return labels
      },
      preparedData: function() {
        if (this.container.capacity <= 0) return [[]]
        // Firstly create an array of length == capacity of container
        let samples = Array.from({length: this.container.capacity}, () => { return {} })

        // Now fill in location with sample data at that location
        for (var i=0; i<this.samples.length; i++) {
          let location = this.samples[i].LOCATION || null
          // Not quite right - need to add as an array for consistency
          if (location) samples[location-1] = this.samples[i]
        }

        // Chop up the list of "samples" at each location into rows/wells
        // [ A [ 1 [1,2], 2 [3,4], ... ], B [ 1 [ 5,6 ], 2 [7,8], ...] ]

        // First parse into an array of wells
        var wells = [];
        while (samples.length) {
          wells.push(samples.splice(0, this.dropsPerWell));
        }

        let chunked_rows = [];
        while (wells.length) {
          chunked_rows.push(wells.splice(0, this.container.columns));
        }

        console.log("Prepared Data = " + JSON.stringify(chunked_rows))

        return chunked_rows;
      }
    },
    watch: {
      selected: function() {
        this.updateSelected()
      }
    },
    mounted: function() {
      this.drawContainer()
      this.updateLabels()
      // this.updateScores()
  },
  methods: {
      drawContainer: function() {
        // Standard practice for d3 chart is to define margin, then define graphic/chart area inset from main svg
        // This allows room for axes labels etc.
        const margin = { top: 40, left: 40, bottom: 20, right: 20 }

        const numColumns = this.preparedData[0].length || 0
        const numRows = this.preparedData.length || 0

        const viewBoxWidth = numColumns*(this.cell.width+2*this.cell.padding+this.cell.margin) + margin.left+margin.right
        const viewBoxHeight = numRows*(this.cell.height+2*this.cell.padding+this.cell.margin) + margin.top+margin.bottom

        const viewBox = [0,0,viewBoxWidth,viewBoxHeight]

        // Make the svg fit within a viewport
        const svg = d3Select('#plate')
          .append('svg')
          .attr('viewBox', viewBox.join(','))
          .attr('preserveAspectRatio', 'xMaxYMax meet')

        // Column labels e.g. 1..12
        svg.append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top-5})`)
          .selectAll('text')
          .data(this.columnLabels)
          .enter()
          .append('text')
            .attr('class', 'column-labels')
            .attr('x', (d,i) => { return (this.cell.width+2*this.cell.padding+this.cell.margin)*i })
            .style('fill', 'black')
            .text( function(d) { return d; })

        // Row labels scale - maps numbers to letters
        let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

        let rowDomain = Array.from({length: letters.length}, (v, i) => i)
        let rowLabels = Array.from({length: letters.length}, (v, i) => letters.charAt(i))

        let letterScale = d3ScaleOrdinal().domain(rowDomain).range(rowLabels)

        // Row labels e.g. A..H
        svg.append('g')
            .attr('transform', `translate(${margin.left - margin.left/2}, ${margin.top+margin.top/2})`)
            .selectAll('text')
            .data(this.preparedData)
            .enter()
            .append('text')
              .attr('class', 'row-labels')
              .attr('y', (d,i) => { return (this.cell.height+2*this.cell.padding+this.cell.margin)*i })
              .style('fill', 'black')
              .text( function(d,i) { return letterScale(i); })

          // Chart area
          this.graphic = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

          this.drawRows(this.graphic)
      },
      // The main plate gra
      drawRows: function(graphic) {
          // This keyword gets used for d3 selection in 'each' method
          let self = this

          let rows = graphic.selectAll('.container-row')
            .data(this.preparedData)
            .enter()
            .append('g')
              .attr('class', 'container-row')
              .attr('transform', (d,i) => { return 'translate(0,' + (this.cell.height+2*this.cell.padding+this.cell.margin)*i + ')'})

          rows.each(function(d, i) {
            d3Select(this).selectAll('.container-cell')
              .data(d)
              .enter()
              .append('g')
                .attr('class', 'container-cell')
                .attr('transform', (d,i) => { return 'translate('+ (self.cell.width+2*self.cell.padding+self.cell.margin)*i + ',0)'})
                .call(self.drawRow, i)
          })
      },
      // Draw well and drops
      // selection is the row data
      // i in the column index,
      drawRow: function(selection) {
        let self = this

        // Draw the cell/well boundary
        selection.append('rect')
          .attr('class', 'container-well')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', this.cell.width+2*this.cell.padding)
          .attr('height', this.cell.height+2*this.cell.padding)
          .style('stroke','black')
          .style('fill','none')
          .style('fill-opacity','0.2')

        // // Draw the drops - grouped into a node
        selection.append('g')
          .attr('class', 'drops')
          .each( function(d) {
            d3Select(this).selectAll('.drop')
              .data(d)
              .enter()
              .append('rect')
                .attr('class', 'drop')
                .attr('x', (d,i) => { return self.dropCoords[i].x })
                .attr('y', (d,i) => { return self.dropCoords[i].y })
                .attr('width', self.dropWidth*self.container.drops.w)
                .attr('height', self.dropHeight*self.container.drops.h)
                .style('fill', 'none')
                .style('stroke', 'gray')
                // .style('fill', (d) => { return self.scoreColors(d) })
                .style("pointer-events","visible") // Required to capture mouse events on non-fill shapes
                .on("click", function() {
                    let cellData = d3Select(this).data()[0]
                    self.onCellClicked(cellData)
                })

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
            })
      },
      updateLabels: function() {
          this.graphic.selectAll('.cell-labels').html((d,i) => { return this.getLabel(d,i) })
      },
      // Use the label prop if provided, else use location index
      getLabel: function(d,index) {
          if (!this.label) return index+1
          else {
              return d[this.label] || null
          }
      },
      // Visualise the cells that are currently selected
      updateSelected: function() {
        // Iterate through selected list of locations..
        this.graphic.selectAll('.drop')
          .style('stroke', (d,i) => { return this.selected.indexOf(i+1) < 0 ? 'gray' : 'steelblue'} )
          .style('stroke-width', (d,i) => { return this.selected.indexOf(i+1) < 0 ? 1 : 2} )
      },

      updateScores: function() {
        // Find all drops and update their scores if they have them
        this.graphic.selectAll('.drop')
          .style('fill', (d) => { return this.scoreColors(d)} )
      },
      // This method has some knowledge of the sample data
      // Used to inform the parent that a cell has been clicked
      onCellClicked: function(sampleData) {
        if (sampleData.LOCATION) {
          // Convert to an actual index not string
          this.$emit('cell-clicked', +sampleData.LOCATION)
        }
      },

      scoreColors: function(d) {
        let scale = null
        let score = d.SCORE || null

        switch(this.colorScale) {
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
        var colorScale = d3ScaleThreshold()
          .domain([0,threshold, 1])
          .range(["lightgray", "lightgray", "green"])

        return colorScale
      },
      rgbScale: function() {
        // Option 1: give 2 color names
        var colorScale = d3ScaleLinear()
          .domain([0,1])
          .range(["red", "green"])

        return colorScale
      },
    }
}
</script>