<template>
  <div>
    <div class="tw-flex tw-flex-wrap tw-w-full">
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Scan File: {{ fileTemplate }}</template></data-collection-field>
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>E(Peak): {{ epk.toFixed(1) }}eV ( {{((12398.4193/epk).toFixed(4)) }}&#197;)</template></data-collection-field>
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>f&rsquo;&rsquo;: {{ numberOfImages }} / f&rsquo;: {{ resolution }}</template></data-collection-field>
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>E(Inf): {{ ein.toFixed(1) }}eV ({{ ((12398.4193/ein).toFixed(4)) }}&#197;)</template></data-collection-field>
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>f&rsquo;&rsquo;: {{ wavelength }} / f&rsquo;: {{ axisRange }}e</template></data-collection-field>
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Exposure: {{ exposureTime }}s</template></data-collection-field>
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Transmission: {{ transmission }}%</template></data-collection-field>
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Beamsize: {{ bsx }}x{{ bsy }}&mu;m</template></data-collection-field>
      <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Axis Position: {{ axisStart}}&deg;</template></data-collection-field>
      <data-collection-field class="tw-w-full tw-mb-1 "><template>Comment: {{ comments }}</template></data-collection-field>
    </div>
  </div>
</template>
<script>
import DataCollectionField from 'modules/dc/components/data-collection-field.vue'
export default {
  name: 'grid-scan-field-list',
  components: {
    'data-collection-field': DataCollectionField
  },
  props: {
    fileTemplate: {
      type: String,
      default: ''
    },
    epk: {
      type: [Number],
    },
    numberOfImages: {
      type: Number
    },
    resolution: {
      type: [Number, String],
      default: ''
    },
    ein: {
      type: [Number],
    },
    wavelength: {
      type: [Number, String],
      default: ''
    },
    axisRange: {
      type: [Number],
      default: ''
    },
    exposureTime: {
      type: [Number, String],
      default: ''
    },
    transmission: {
      type: [Number, String],
      default: ''
    },
    bsx: {
      type: Number,
    },
    bsy: {
      type: Number,
    },
    axisStart: {
      type: [Number],
      default: ''
    },
    comments: {
      type: String,
      default: ''
    }
  },
  methods: {
    enlargeImage() {
      this.$emit('enlarge-image')
    }
  },
}
</script>