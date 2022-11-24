<template>

    <div>

        <p class="tw-m-4 tw-p-4 tw-text-lg md:tw-text-2xl 
                tw-mx-auto tw-border-b tw-border-gray-500">
                Visit List</p>

        <div class="tw-mt-12 tw-mb-4">
            
        </div>

        <div class="tw-overflow-x-scroll tw-scrolling-touch">

            <div class="tw-pb-2">
                <input placeholder='Search'                         
                       v-on:keyup.enter="fetchData" 
                       v-model = "searchVisit"/>
            </div>

            <table class="tw-w-full tw-mb-2">
                <thead>
                    <td v-for="(value) in headers" :key="value.id"
                    class="tw-w-1/8 tw-bg-table-header-background tw-text-table-header-color tw-font-bold tw-py-2 tw-text-center">
                    {{value.title}}
                    </td>
                </thead>

                <tbody v-for="(visit, rowIndex) in visits" :key="visit.id" >
                    <tr class="hover:tw-bg-table-row-hover-background"
                        @click="navigator($event, visit)"
                        @focusout="handleFocusOut(visit)"
                    :class="{
                                'tw-bg-table-body-background-odd' : rowIndex % 2,
                                'tw-bg-content-sub-header-background' : isOdd % 2,
                            }"> 
                        <td v-for="(value) in headers" :key="value.id"
                            :id="value.key" class="tw-p-1 tw-text-center">
                                <p v-if="value.key != 'COMMENTS' && value.key != 'ARCHIVED'">{{visit[value.key]}}</p>
                                <p v-if="value.key == 'COMMENTS' && visit.clicked == false">{{visit.COMMENTS}}</p>
                                <input v-if="value.key == 'COMMENTS' && visit.clicked == true"
                                       title="Comment cannot be seen by User Office"
                                       v-model="visit.edited_comment"
                                       v-on:keyup.enter="onEnter(visit)" />
                                <i class="fa fa-archive r" title="This visit is archived, file is no longer available on disk" v-if="value.key == 'ARCHIVED' && visit.ARCHIVED == 1"></i>
                                 
                        </td>
                    </tr>
                
                </tbody>

            </table>

            <div v-if="visits.length == 0" class="tw-bg-table-body-background-odd tw-w-full tw-mb-2 tw-text-center">
                <p>No Visits Found</p></div>


            <pagination-panel
            :initial-page="1"
            :totalRecords=totalRecords
            :pageLinks="10"
            @page-changed="handlePageChange"
            />

        </div>
        
    </div>

</template>

<script>
import VisitCollection from 'collections/visits'
import VisitModel from 'models/visit'

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
            totalRecords:  10,
            pageSize: 15,
            currentPage: 1,
            proposal: app.prop,
            visitCollection: [],
            visits: [],
            searchVisit : '',
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
                {
                    key: "ARCHIVED"
                }

            ]

        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            // fetches visit data based on prop
            this.visitCollection = new VisitCollection()
            this.visitCollection.queryParams = { page: this.currentPage, per_page: this.pageSize };

            this.visitCollection.queryParams.prop = this.proposal;
            this.visitCollection.queryParams.s = this.searchVisit;

            const results = await this.$store.dispatch('getCollection', this.visitCollection);
            this.visits = results.toJSON().map((e) => {
                return { ...e, clicked: false , edited_comment: e.COMMENTS};
            });

            this.totalRecords = results.state.totalRecords;

        },
        handlePageChange(data) {
            try {

            this.currentPage = data.currentPage;
            this.pageSize = data.pageSize;

            this.fetchData();

            }
            catch(e) {
                window.onerror('Cannot go to selected page: ' + e);

                return ;
            }

        },
        async onEnter(visit) {
            // when changing comments for visits
            visit.COMMENTS = visit.edited_comment;

            visit.clicked = false;

            await this.$store.dispatch('updateDataToApi', {
            url: '/proposal/visits/' + visit.VISIT + '?prop=' + visit.PROPOSAL + '&COMMENTS=' + visit.COMMENTS,
            updateType: 'PATCH',
            requestType: 'updating comment for visit'
            }).then(
                    (response) => {
                        console.log('commented', response)
                    }
                )

        },
        navigator(event, visit) {
            // navigates to dc visit page unless it is the comment column, then input box is visible
            if(event.target.parentElement.id == 'COMMENTS' || event.target.id == 'COMMENTS') {
                visit.clicked = true;
            }
            else {
                // window.location.href = 'dc/visit/' + this.proposal + '-' + visit.VIS;
            }
        },
        handleFocusOut(visit) {
            // if click outside of active input box then input returns to text
            if(visit.clicked) {
                visit.clicked = false;
            }
        }
    },


    
}
</script>

<style scoped>
</style>
