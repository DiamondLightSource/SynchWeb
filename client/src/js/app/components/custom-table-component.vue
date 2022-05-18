<template>
  <div class="table-responsive tw-w-full">
    <table class="table" :style="`width: ${tableWidth}; min-width: ${tableWidth}`" :class="tableClass">
      <thead>
        <tr class="tw-bg-table-header-background tw-text-table-header-color tw-font-bold">
          <slot name="tableHeaders"></slot>
        </tr>
      </thead>
      <tbody :style="{ 'max-height': maxTableHeight, 'height': tableHeight }" :class="{'no-hover': unsetHover , custom}">
        <slot name="addNew"></slot>
        <slot name="slotData" :dataList="dataList"></slot>
        <slot name="noData" v-if="dataList.length < 1"></slot>
        <slot name="footer"></slot>
      </tbody>
    </table>
  </div>
</template>
<script>

export default {
  name: 'custom-table-component',
  props: {
    dataList: {
      type: Array,
    },
    tableHeight: {
      type: String,
    },
    maxTableHeight: {
      type: String,
    },
    tableWidth: {
      type: String,
    },
    custom: {
      type: String,
    },
    unsetHover: {
      type: Boolean,
      default: false
    },
    tableClass: {
      type: String
    }
  },
  data() {
    return {}
  },
  methods: {
    getNextItems($state) {
      this.$emit('load-next', $state)
    },
  },
}
</script>
<style scoped>
.table table.vue-table tr:hover td {
  cursor: pointer;
  background: #dedede;
}
</style>