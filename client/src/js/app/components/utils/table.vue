<template>
  <!-- Pass in headers and data as props-->
  <div class="content">
    <div class="table">
      <table class="vue-table">

        <thead>
          <th
            v-for="(header,index) in headers" :key="index"
            class=""
            @click="$emit('sort-by', header.key)">{{header.title}}</th>
          <th v-if="actions">{{actions}}</th>
        </thead>

        <!-- Change row[header.key] to row.get(header.key) if using Backbone models -->
        <tbody v-if="data && data.length > 0">
          <tr
            v-for="(row, index) in data"
            :key="index"
            v-on:click="$emit('row-clicked', row)">

            <!-- Default row layout override with the content slot if you need items like form inputs-->
            <slot name="content" v-bind:row="row">
              <td v-for="(header, index) in headers" :key="index">{{row[header.key].model}}</td>
            </slot>

            <td v-if="actions"><slot name="actions" v-bind:row="row"></slot></td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td :colspan="headers.length" class="renderable">{{noDataText}}</td>
          </tr>
        </tbody>

      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    'headers': {
      type: Object,
      required: true
    },
    'data': {
      type: Array,
      required: true
    },
    'noDataText': {
      type: String,
      required: false,
      default: 'No data found'
    },
    // Text title to indicate there are action buttons in the last column
    'actions': {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>

/* Table styles are set explicitly in SW - Here we want a generic selected hghlight */
.table table.vue-table tr:hover td {
    cursor: pointer;
    background: #dedede;
}

</style>