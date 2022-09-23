<template>
  <div class="table-responsive">
    <table
      class="table"
      :style="`width: ${tableWidth}; min-width: ${tableWidth}`"
      :class="tableClass"
    >
      <thead>
        <tr class="tw-bg-table-header-background tw-text-table-header-color tw-font-bold">
          <slot name="tableHeaders" />
        </tr>
      </thead>
      <tbody
        :style="{ height: tableHeight }"
        :class="{'no-hover': unsetHover , custom}"
      >
        <slot name="addNew" />
        <slot
          name="slotData"
          :data-list="dataList"
        />
        <slot
          v-if="dataList.length < 1"
          name="noData"
        />
        <slot name="footer" />
      </tbody>
    </table>
  </div>
</template>
<script>

export default {
  name: 'CustomTableComponent',
  props: {
    dataList: {
      type: Array,
    },
    tableHeight: {
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