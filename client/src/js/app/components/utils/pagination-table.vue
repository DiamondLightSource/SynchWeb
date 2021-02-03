<template>
  <div>
    <table-component
      :headers="headers"
      :data="data"
      @row-clicked="onRowClicked"
    />
    <pagination-control
      :pageSizes="pages"
      @page-changed="onPaginationChanged"
    />
  </div>
</template>

<script>
import Table from 'app/components/utils/table.vue'
import Pagination from 'app/components/utils/pagination.vue'

export default {
  name: 'pageable-table',

  components: {
    'table-component': Table,
    'pagination-control' : Pagination
  },

  data: function() {
    return {
      pages: [5,10,15],
      headers: [
        {title: 'Header 1', key: 'H1'},
        {title: 'Header 2', key: 'H2'},
        {title: 'Header 3', key: 'H3'},
      ],
      data: [
        {H1: 'Data 1-1', H2: "Data 1-2", H3: "Data 1-3" },
        {H1: 'Data 2-1', H2: "Data 2-2", H3: "Data 2-3" },
        {H1: 'Data 3-1', H2: "Data 3-2", H3: "Data 3-3" },
        {H1: 'Data 4-1', H2: "Data 4-2", H3: "Data 4-3" },
      ]
    }
  },
  methods: {
    onPaginationChanged: function(payload) {
      console.log("Pagination changed: " + payload)
    },
    onRowClicked: function(item) {
      console.log("Row clicked: " + item)
    }
  }
}
</script>