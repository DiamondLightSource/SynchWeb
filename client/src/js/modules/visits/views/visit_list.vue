<template>

        <div class="tw-overflow-x-scroll tw-scrolling-touch">

            <table class="tw-w-full">
                <thead>
                    <td v-for="(value) in headers" :key="value.id"
                    class="tw-w-1/8 tw-bg-table-header-background tw-text-table-header-color tw-font-bold tw-py-2 tw-text-center">
                    {{value.title}}
                    </td>
                </thead>

                <tbody v-for="(visit, rowIndex) in visits" :key="visit.id" >
                    <tr class="hover:tw-bg-table-row-hover-background"
                        @click="navigator(visit.VIS)"
                    :class="{
                                'tw-bg-table-body-background-odd' : rowIndex % 2,
                                'tw-bg-content-sub-header-background' : isOdd % 2,
                            }"> 
                        <td v-for="(value) in headers" :key="value.id"
                            class="tw-p-1 tw-text-center ">
                                <p v-if="value.key != 'COMMENTS'">{{visit[value.key]}}</p>
                                <p v-else> Hello! </p>
                        </td>
                    </tr>
                
                </tbody>

            </table>

        </div>     

</template>

<script>
import VisitCollection from 'collections/visits'

import Pagination from 'app/components/pagination.vue'
import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'


export default {
    name:'Visits',
    components: {
    'custom-table-component': CustomTableComponent,
    'custom-table-row':CustomTableRow,
    'pagination-panel': Pagination,
    },
    props: {
        'visit' : String,
    },
    data() {
        return {
            proposal: app.prop,
            visitCollection: [],
            visits: [],
            headers: [
                {
                    key: "STARTDATE",
                    title: 'Start'
                },
                {
                    key: "ENDDATE",
                    title: 'End'
                },
                {
                    key: "VIS",
                    title: 'Number'
                },
                {
                    key: "BEAMLINENAME",
                    title: 'Beamline'
                },
                {
                    key: "LC",
                    title: 'Local Contact'
                },
                {
                    key: "COMMENTS",
                    title: 'Comments'
                },
                {
                    key: "DCCOUNT",
                    title: 'Data Collections'
                },
                {
                    key: "SESSIONTYPE",
                    title: 'Type'
                },

            ]

        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        async fetchData() {

            console.log(Object.keys(this.headers).length)
            this.visitCollection = new VisitCollection()
            this.visitCollection.queryParams = { page: this.currentPage, per_page: this.pageSize };
            this.visitCollection.queryParams.prop = this.proposal;

            const results = await this.$store.dispatch('getCollection', this.visitCollection);
            this.visits= results.toJSON();

        },
        navigator (visit) {
            window.location.href = 'dc/visit/' + this.proposal + '-' + visit;

        }
    },
    computed: {

    }

    
}
</script>

<style scoped>
.screen-component-group-table /deep/ tbody tr:nth-child(odd) {
  @apply tw-bg-table-body-background-odd;
}

.screen-component-group-table /deep/ tbody tr:nth-child(even) {
  @apply tw-bg-table-body-background}
</style>
