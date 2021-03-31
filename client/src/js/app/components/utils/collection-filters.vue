<template>
  <ul class="tw-flex">
      <li
        class="tw-mx-1 tw-rounded-md tw-cursor-pointer tw-p-2 tw-bg-content-filter-background"
        :class="filterItem.isSelected
            ? 'tw-bg-content-filter-current-background'
            : 'tw-bg-content-filter-background'
        "
        v-for="(filterItem, filterItemIndex) in filterData"
        :key="filterItemIndex"
        @click="toggleFilterSelection(filterItem)">
          {{ filterItem.name }}
      </li>
  </ul>
</template>

<script>
export default {
    name: 'CollectionFilters',
    props: {
        filterData: {
            // Filter data should be an array of object in this format
            // { id: <string|number>, name: <string> }
            type: Array,
            default: () => ([])
        }
    },
    methods: {
        toggleFilterSelection(filterItem) {
            this.$emit('toggle-filter-selection', filterItem)
        }
    }
}
</script>

<style>
</style>