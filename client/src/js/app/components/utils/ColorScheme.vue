<template>
  <div class="tw-flex tw-w-full">
    <div class="tw-mr-2 tw-flex tw-align-items">
      <label for="rampSelect" class="tw-flex tw-align-center tw-py-2 tw-mr-2">Drop Color</label>
      <select id="rampSelect" @change="setColorRange" v-model="selectedRampName">
        <option v-for="(rampName, rampIndex) in rampNames" :key="rampIndex" :selected="rampName === selectedRampName">
          {{ rampName }}
        </option>
      </select>
    </div>

    <div class="tw-ml-2 tw-mr-2 tw-flex tw-align-items">
      <label for="colorNumberSelect" class="tw-flex tw-align-center tw-py-2 tw-mr-2">Gradient</label>
      <select id="colorNumberSelect" @change="setColorRange" v-model="selectedColorNumbers">
        <option v-for="(colorNumber, colorNumberIndex) in colorNumbers" :key="colorNumberIndex" :selected="colorNumber === selectedColorNumbers">
          {{ colorNumber }}
        </option>
      </select>
    </div>
    <div class="tw-ml-2 tw-flex tw-align-items tw-align-items">
      <label for="colorRangeFromSample" class="tw-flex tw-align-center tw-py-2 tw-mr-2">Threshold Value: </label>
      <span class="tw-flex tw-items-center">
        <input
          :value="colorThreshold"
          type="range" 
          min="1"
          max="100"
          @input="setColorThreshold($event)"
          id="colorRangeFromSample"
          class="tw-appearance-none tw-w-full tw-h-1 tw-bg-gray-400 tw-rounded tw-outline-none slider-thumb">
        <p class="tw-mb-0 tw-ml-2">{{colorThreshold}}%</p>
      </span>
    </div>
  </div>
</template>
<script>
import * as d3Chromatic from 'd3-scale-chromatic'
import * as d3Color from 'd3-color'

export default {
  name: "ColorScheme",
  data() {
    return {
      rampNames: [
        'Blues',
        'Greens',
        'Greys',
        'Oranges',
        'Purples',
        'Reds',
        'BuGn',
        'BuPu',
        'GnBu',
        'OrRd',
        'PuBuGn',
        'PuBu',
        'PuRd',
        'RdPu',
        'YlGnBu',
        'YlGn',
        'YlOrBr',
        'YlOrRd',
        'Cividis',
        'Viridis',
        'Inferno',
        'Magma',
        'Plasma',
        'Warm',
        'Cool',
        'CubehelixDefault',
        'Turbo',
        'BrBG',
        'PRGn',
        'PiYG',
        'PuOr',
        'RdBu',
        'RdGy',
        'RdYlBu',
        'RdYlGn',
        'Spectral',
        'Rainbow',
        'Sinebow'
      ],
      colorNumbers: [256, 11, 10, 9, 8, 7, 6, 5, 4, 3 ],
      selectedRampName: 'Blues',
      selectedColorNumbers: 9,
      selectedColors: [],
      colorInterpolationType: '',
      colorThreshold: 10
    };
  },
  created() {
    this.setColorRange()
  },
  methods: {
    setColorRange() {
      if (d3Chromatic[`scheme${this.selectedRampName}`] && d3Chromatic[`scheme${this.selectedRampName}`][this.selectedColorNumbers]) {
        this.selectedColors = d3Chromatic[`scheme${this.selectedRampName}`][this.selectedColorNumbers];
      } else {
        const interpolate = d3Chromatic[`interpolate${this.selectedRampName}`];
        this.selectedColors = [];
        for (let i = 0; i < this.selectedColorNumbers; ++i) {
          this.selectedColors.push(d3Color.rgb(interpolate(i / (this.selectedColorNumbers - 1))).formatHex());
        }
      }

      this.$emit('update-color-range-of-samples', { selectedColorRange : this.selectedColors, threshold: this.colorThreshold })
    },
    setColorThreshold(event) {
      this.colorThreshold = event.target.value

      this.$emit('update-color-range-of-samples', { selectedColorRange: this.selectedColors, threshold: this.colorThreshold })
    }
  }
}
</script>