<!--
Table component
Pass in headers array with key and title properties, example:
headers: [{key: 'NAME', title: 'Name'}, {key: 'ID', title: 'Id'}]
data: [{NAME: 'Alice', ID: 1}, {NAME: 'Bob', ID: 2}]
"title" is column title, "key" is attribte that provides the data
Slots:
- content = override row with <td> items e.g. for form inputs. "row" data are provided to the slot
- actions = place to store buttons in last column. Specify a title for the actions column to show them.

The html structure is designed to use existing synchweb css styles
TODO - move relevant styles to this component style section
-->
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
          <slot :data="data" :headers="headers">
            <tr
              v-for="(row, index) in data"
              :key="index"
              v-on:click="$emit('row-clicked', row)">

              <!-- Default row layout override with the content slot if you need items like form inputs-->
              <slot name="content" v-bind:row="row">
                <td v-for="(header, index) in headers" :key="index">{{row[header.key]}}</td>
              </slot>

              <td v-if="actions"><slot name="actions" v-bind:row="row"></slot></td>
            </tr>
          </slot>
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
    // Text title for action column - indicates there are action buttons to display
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