
<!--
Component that renders a puck with 16 locations
Tries to be as data agnostic as possible
OnClickEvent will only fire if there is data bound to the element with a valid LOCATION property
TODO - move the score colour methods to a utility class
-->
<template>
  <div>
    <div :id="puckId" />
  </div>
</template>


<script>
import {select as d3Select, selectAll as d3SelectAll} from 'd3-selection'
import { scaleLinear as d3ScaleLinear} from 'd3-scale'
import { scaleThreshold as d3ScaleThreshold} from 'd3-scale'
import { interpolateViridis as d3InterpolateViridis} from 'd3-scale-chromatic'
export default {
  name: 'PuckView',
  props: {
    'container': Object, // Plate geometry
    // Data bound to each cell / drop location
    samples: {
      type: Array,
      default: () => ([])
    },
    label: {
      type: String, // Which key within the sample data should be shown (location index if nothing provided)
      required: false
    },
    'colorScale': String, // color-scale mapped to colorScale prop
    'threshold': Number, // Threshold used as part of colorScale
    'colorAttribute': {
      type: String,
      default: 'SCORE'
    },
    puckId: {
      type: String,
      default: 'puck'
    },
    selectedDrops: {
      type: Array,
      default: () => ([])
    },
    selectedSamples: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    let sampleCentres, sampleRadius, sampleHighlightRadius, containerImage
    if (this.container.containerType === "VMXm-Cartridge") {
      sampleCentres = [
        [235, 75],
        [235, 155],
        [235, 235],
        [235, 315],
        [235, 395],
      ]
      sampleRadius = 35
      sampleHighlightRadius = 30
      containerImage = '/assets/images/cartridge_no_labels_470x470.png'
    } else if (this.container.containerType === "VMXm-GridBox") {
      sampleCentres = [
        [315, 310],
        [315, 160],
        [155, 160],
        [155, 310],
      ]
      sampleRadius = 50
      sampleHighlightRadius = 19
      containerImage = '/assets/images/gridbox_no_labels_470x470.png'
    } else if (this.container.capacity === "4") {
      sampleCentres = [
        [152.5, 152.5],
        [317.5, 152.5],
        [152.5, 317.5],
        [317.5, 317.5],
      ]
      sampleRadius = 75
      sampleHighlightRadius = 60
      containerImage = '/assets/images/block-4_no_labels_470x470.png'
    } else {
      sampleCentres = [
        [235, 157],
        [158, 213],
        [188, 301],
        [281, 300],
        [310, 211],
        [234, 62],
        [140, 91],
        [76, 165],
        [63, 263],
        [101, 349],
        [186, 401],
        [283, 402],
        [367, 350],
        [406, 261],
        [393, 163],
        [329, 92],
      ]
      sampleRadius = 44
      sampleHighlightRadius = 35
      containerImage = '/assets/images/puck_no_labels_470x470.png'
    }
    return {
      // Define geometry of puck locations
      cell: {
        radius: sampleRadius,
        highlightRadius: sampleHighlightRadius,
      },
      // Centre coordinates of puck 470x470 pixels
      // Changing the background image would require changing the centres
      centres: sampleCentres,
      puckImage: containerImage,
      // Holders for svg elements used in updates
      graphic: null, // Holder for svg puck graphic
      labels: null, // Holder for text labels
    }
  },
  computed: {
    preparedData: function() {
      // Firstly create an array of length == capacity of container
      let samplesArray = Array.from({length: this.centres.length}, (_,i) => { return { LOCATION: i + 1 } })
      // Now fill in location with sample data at that location
      for (var i = 0; i < this.samples.length; i++) {
        // Only looking at first 16 samples passed into us
        let location = Number(this.samples[i].LOCATION) || null
        // Not quite right - need to add as an array for consistency
        if (location && location <= samplesArray.length) {
          samplesArray[location-1] = this.samples[i]
        }
      }
      return samplesArray;
    }
  },
  watch: {
    samples: {
      handler() {
        d3SelectAll(`#${this.puckId} > *`).remove()
        this.drawContainer()
        this.updateSelected()
        this.showLabels()
        this.updateSampleCells()
      },
      deep: true,
      immediate: true
    }
  },
  mounted: function() {
    d3SelectAll(`#${this.puckId} > *`).remove()
    this.drawContainer()
    this.updateSelected()
    this.showLabels()
    this.updateSampleCells()
  },
  methods: {
    // Create the svg graphic representation of the puck
    drawContainer: function() {
      // For the puck we have no need for a label
      // In fact we keep the graphic as the same size as svg to map a background image
      // So this does not use the standard d3 margin setup - see plate view for that
      const viewBoxWidth = 800
      const viewBoxHeight = 500
      const viewBox = [0,0,viewBoxWidth,viewBoxHeight]
      // Make the svg fit within a viewport
      const svg = d3Select(`#${this.puckId}`)
          .append('svg')
          .attr('viewBox', viewBox.join(','))
          .attr('preserveAspectRatio', 'xMaxYMax meet')
      // Add the background image
      svg.append('image')
          .attr('href', this.puckImage)
          .attr('width', 470)
          .attr('height', 470)
      // Chart area
      this.graphic = svg.append('g')
      this.labels = svg.append('g')
      // The 'this' keyword gets bound to the d3 selection in 'on' method
      let self = this
      // Draw circles for each sample location
      this.graphic.selectAll('.sample-cell')
          .data(this.preparedData)
          .enter()
          .append('circle')
          .attr('class', 'sample-cell')
          .attr('r', this.cell.radius)
          .attr('cx', (d,i) => this.centres[i][0] )
          .attr('cy', (d,i) => this.centres[i][1] )
          .style('fill', 'none')
          .style('stroke', '#666')
          .style('stroke-width', 4)
          .style("pointer-events","visible") // Required to capture mouse events on non-fill shapes
          .on("click", function() {
            let cellData = d3Select(this).data()[0]
            self.onCellClicked(cellData)
          })
          // Highlight is achieved by shrinking the cell radius
          .on("mouseover", function() {
            d3Select(this)
                .attr('r', self.cell.highlightRadius)
                .style('stroke-width', 2)
          })
          .on("mouseleave", function() {
            d3Select(this)
                .attr('r', self.cell.radius)
                .style('stroke-width', 4)
          })
    },
    // This method has some knowledge of the sample data
    // Used to inform the parent that a cell has been clicked
    onCellClicked: function(sampleData) {
      if (sampleData && sampleData.BLSAMPLEID) {
        // Convert to an actual index not string
        this.$emit('cell-clicked', { location: + sampleData.LOCATION, type: 'puck' })
      } else {
        // All samples should have a location
        this.$emit('cell-clicked', { location: + sampleData.LOCATION, type: 'puck' })
      }
    },
    updateSelected: function() {
      this.graphic.selectAll('.sample-cell')
          .style('stroke', (d,i) => {
            return this.samples.indexOf(i) < 0 ? '#666' : 'steelblue'}
          )
    },
    // Visualise which cells are valid or invalid
    // When using backbone models we need to check if the sample model is valid via a method.
    updateSampleCells: function() {
      this.graphic.selectAll('.sample-cell')
          .style('fill', (d) => this.scoreColors(d))
          .style('stroke', '#666')
    },
    // Work out what should be displayed in the cell locations
    showLabels: function() {
      // We may want labels for all cells, not just those with samples in
      this.labels.selectAll('.label')
          .data(this.centres)
          .enter()
          .append('text')
          .html( (d,i) => this.getLabel(i) )
          .attr('x', (d) => d[0] )
          .attr('y', (d) => d[1] )
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('class', 'label')
          .style("pointer-events","none") // Required to capture mouse events on non-fill shapes
    },
    // Use the label prop if provided, else use location index
    getLabel: function(index) {
      if (!this.label) return index+1
      else {
        return this.preparedData[index][this.label] || null
      }
    },
    // In case we want to ignore labels, we can remove them with this method...
    removeLabels: function() {
      this.labels.selectAll('.label')
          .data([])
          .exit()
          .remove()
    },
    // TODO - move these color functions into a separate utility class
    scoreColors: function(d) {
      let scale
      let score
      const selectedSample = this.selectedSamples.find(sample => Number(sample['LOCATION']) === Number(d.LOCATION))

      if (selectedSample) {
        score = selectedSample[this.colorAttribute]
      } else if (!selectedSample && d[this.colorAttribute]) {
        score = d[this.colorAttribute]
      } else {
        score = null
      }

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
      return d3ScaleThreshold()
          .domain([0,threshold, 1])
          .range(["lightgray", "lightgray", "green"])
    },
    rgbScale: function() {
      // Option 1: give 2 color names
      return d3ScaleLinear()
          .domain([0,1])
          .range(["red", "green"])
    },
  }
}
</script>
