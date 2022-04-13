<template>
  <div class="tw-w-full tw-flex tw-flex-col">
    <data-collection-field class="tw-mb-1"><template>Sample: <router-link :to="`/samples/sid/${sampleId}`" class="tw-text-link-color">{{ sample }}</router-link></template></data-collection-field>
    <data-collection-field class="tw-mb-1"><template><span v-html="rotationAxisSymbol"></span> Start: {{ axisStart }}&#8304;</template></data-collection-field>
    <data-collection-field class="tw-mb-1" v-if="hasKappaPhiOrChi"><template><span v-html="kappaPhiChiValues"></span></template></data-collection-field>
    <data-collection-field class="tw-mb-1"><template>Resolution: {{ resolution }}&#197;</template></data-collection-field>
    <data-collection-field class="tw-mb-1"><template>Wavelength: {{ wavelength }}&#197;</template></data-collection-field>
    <data-collection-field class="tw-mb-1"><template>Exposure: {{ exposureTime }}s</template></data-collection-field>
    <data-collection-field class="tw-mb-1"><template>Transmission: {{ transmission }}%</template></data-collection-field>
    <data-collection-field class="tw-mb-1"><template>Beamsize: {{ bsx }}x{{ bsy }}&mu;m</template></data-collection-field>
    <data-collection-field class="tw-mb-1"><template>Boxsize: {{ boxSizeX }}x {{ boxSizeY }}&mu;m</template></data-collection-field>
    <data-collection-field class="tw-mb-1 "><template>Comment: {{ comments }}</template></data-collection-field>
    <data-collection-field class="tw-mb-1" v-if="!state"><template class="tw-font-bold">Stopped</template></data-collection-field>
    <data-collection-field class="tw-mb-1">
      <template>
        <span class="img"></span>
        <span class="val"></span>
      </template>
    </data-collection-field>
    <data-collection-field class="tw-mb-1">
      <template>
        <span class="x"></span>
        <span class="y"></span>
        <span class="z"></span>
      </template>
    </data-collection-field>
    <button class="button tw-text-link-color tw-w-20" @click="enlargeImage"><i class="fa fa-search-plus"></i>  Enlarge</button>
    <h1 title="Xray Centring Status and Results" class="xrc"><span><i class="fa fa-spinner fa-spin"></i></span></h1>
  </div>
</template>
<script>
// TODO: Watch when grid plot changes and update the last two data collection fields above
import DataCollectionField from 'modules/dc/components/data-collection-field.vue'
export default {
  name: 'grid-scan-field-list',
  components: {
    'data-collection-field': DataCollectionField
  },
  props: {
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
    kappaPhiChiValues: {
      type: String,
      default: ''
    },
    rotationAxisSymbol: {
      type: String,
      default: ''
    },
    axisStart: {
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
  },
  methods: {
    enlargeImage() {
      this.$emit('enlarge-image')
    }
  },
}
</script>