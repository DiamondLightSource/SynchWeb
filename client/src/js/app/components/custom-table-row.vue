<template>
  <tr>
    <slot
      :result="result"
      :row-index="rowIndex"
    />
  </tr>
</template>
<script>
export default {
  name: 'CustomTableRow',
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
