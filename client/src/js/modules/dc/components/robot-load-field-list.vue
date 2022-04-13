<template>
  <div class="tw-flex tw-flex-wrap tw-w-full">
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Sample: <router-link :to="`/samples/sid/${sampleId}`" class="tw-text-link-color">{{ sample }}</router-link></template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Took: {{ bsx }}s;</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Barcode: {{ directory }}&#197;</template></data-collection-field>
    <data-collection-field class="tw-w-1/2 tw-mb-1"><template>Puck: {{ exposureTime }} Pin: {{ resolution }}</template></data-collection-field>
    <data-collection-field class="tw-mb-1"><template>Status: {{ spos }} - {{ san }}</template></data-collection-field>
  </div>
</template>
<script>
import DataCollectionField from 'modules/dc/components/data-collection-field.vue'
export default {
  name: 'robot-load-field-list',
  components: {
    'data-collection-field': DataCollectionField
  },
  props: {
    sampleId: {
      type: [Number, String]
    },
    sample: {
      type: String,
      default: ''
    },
    resolution: {
      type: [Number, String],
      default: ''
    },
    exposureTime: {
      type: [Number, String],
      default: ''
    },
    directory: {
      type: String,
      default: ''
    },
    bsx: {
      type: Number,
    },
    spos: {
      type: String,
    },
    san: {
      type: String
    }
  },
  methods: {
    enlargeImage() {
      this.$emit('enlarge-image')
    }
  },
}
</script>