<template>
    <!-- Pass in headers and data as props-->
    <div class="content">
        <div class="table">
            <table class="vue-table">
                <thead>
                    <th
                        v-for="(header,index) in headers" :key="index"
                        class=""
                        @click="$emit('sort-by', header.key)">{{header.title}}
                    </th>
                </thead>
                <!-- Change row[header.key] to row.get(header.key) if using Backbone models -->
                <tbody v-if="data && data.length > 0">
                    <slot :data="data" :headers="headers">
                        <tr v-for="(row, index) in data" :key="index" v-on:click="$emit('row-clicked', row)">
                            <td v-for="(header, headerIndex) in headers" :key="headerIndex" class="">
                                {{row[header.key]}}
                            </td>
                        </tr>
                    </slot> 
                </tbody>
                <tbody v-else>
                    <tr>
                        <td :colspan="headers.length" class="renderable">No data found</td>
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