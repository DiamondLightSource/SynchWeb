<template>
  <div class="tw-flex tw-w-full">
    <div
        class="tw-rounded tw-p-2 tw-mx-1"
        v-for="(filter, filterIndex) in filterData"
        :key="filterIndex"
        :class="{
        'tw-bg-content-filter-background': selected !== retrieveFilterValue(filter),
        'tw-bg-content-filter-current-background': selected === retrieveFilterValue(filter) ,
        'tw-cursor-pointer': selected !== retrieveFilterValue(filter)
      }"
        @click="onSelect(valueField ? filter[valueField] : filter)">
      {{ textField ? filter[textField] : filter }}
    </div>
  </div>
</template>
<script>
export default {
  name: 'filter-pills',
  props: {
    filterData: {
      type: Array,
      required: true
    },
    textField: {
      type: String,
    },
    valueField: {
      type: String,
    },
    selected: {
      type: [Object, Number, String],
      required: true
    }
  },
  methods: {
    onSelect(value) {
      if (value !== this.selected) {
        this.$emit('filter-selected', value)
      }
    },
    retrieveFilterValue(filter) {
      return this.valueField ? filter[this.valueField] : filters
    }
  }
}
</script>