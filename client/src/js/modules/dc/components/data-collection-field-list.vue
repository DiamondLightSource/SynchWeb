<template>
  <div class="tw-flex tw-flex-wrap tw-w-full">
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Sample: <router-link :to="`/samples/sid/${sampleId}`" class="tw-text-link-color">{{ sample }}</router-link></template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Flux: {{ parseFloat(flux).toExponential(2) }}</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template><span v-html="rotationAxisSymbol"></span> Start: {{ axisStart }}&#8304;</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template><span v-html="rotationAxisSymbol"></span> Osc: {{ axisRange }}&#8304;</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template><span v-html="rotationAxisSymbol"></span> Overlap: {{ overlap }}&#8304;</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Number of Images: {{ numberOfImages }}</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1" v-if="firstImage !== 1"><template>First Image: {{ firstImage }}</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1" v-if="hasKappaPhiOrChi"><template><span v-html="kappaPhiChiValues"></span></template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Resolution: {{ resolution }}&#197;</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Wavelength: {{ wavelength }}&#197;</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Exposure: {{ exposureTime }}s</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Transmission: {{ transmission }}%</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Beamsize: {{ bsx }}x{{ bsy }}&mu;m</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Type: <span v-if="dct">{{ dct }}</span></template></data-collection-field>
    <data-collection-field class="tw-w-full tw-mb-1 "><template>Comment: {{ comments }}</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1" v-if="!state"><template class="tw-font-bold">Stopped</template></data-collection-field>
  </div>
</template>
<script>
import DataCollectionField from 'modules/dc/components/data-collection-field.vue'
export default {
  name: 'data-collection-field-list',
  components: {
    'data-collection-field': DataCollectionField
  },
  props: {
    kappaPhiChiValues: {
      type: String,
      default: ''
    },
    sample: {
      type: String,
      default: ''
    },
    sampleId: {
      type: [String, Number],
      default: ''
    },
    flux: {
      type: [String, Number],
    },
    firstImage: {
      type: String,
    },
    numberOfImages: {
      type: Number
    },
    rotationAxisSymbol: {
      type: String,
      default: ''
    },
    axisStart: {
      type: [Number],
      default: ''
    },
    axisRange: {
      type: [Number],
      default: ''
    },
    resolution: {
      type: [Number, String],
      default: ''
    },
    wavelength: {
      type: [Number, String],
      default: ''
    },
    exposureTime: {
      type: [Number, String],
      default: ''
    },
    comments: {
      type: String,
      default: ''
    },
    transmission: {
      type: [Number, String],
      default: ''
    },
    state: {
      type: Boolean,
      default: true
    },
    bsx: {
      type: Number,
    },
    bsy: {
      type: Number,
    },
    boxSizeX: {
      type: Number
    },
    boxSizeY: {
      type: Number
    },
    hasKappaPhiOrChi: {
      type: Boolean
    }
  }
}
</script>