<template>
  <tr>
    <slot :result="result" :rowIndex="rowIndex"></slot>
  </tr>
</template>
<script>
export default {
  name: 'custom-table-row',
  props: {
    result: {
      type: Object,
    },
    rowIndex: {
      type: Number,
    }
  }
}
</script>
<style lang="scss" scoped>
.table td {
  border-bottom: none;
}
</style>
