<template>
    <div>

        <p class="tw-m-4 tw-p-4 tw-text-lg md:tw-text-2xl 
        tw-mx-auto tw-border-b tw-border-gray-500">
        Data Collection Summary</p>

        <div class="tw-mt-12 tw-mb-4">
            
        </div>


        <div>
            <expandable-sidebar >
                <template v-slot:filter-bar-title> 
                    <div class="tw-grid tw-grid-cols-2">
                        <div class="tw-col-span-3 tw-mt-3 tw-ml-3">
                            <i class="fa fa-filter tw-mb-1"></i>
                            <h> Filter </h>
                        </div>
                        <div class="tw-col-span-1 tw-col-start-5 tw-mt-2 tw-mr-3 ">

                            <div class="tw-flex tw-mb-2">
                                <button @click="searchFilterParams" 
                                class="tw-text-center tw-bg-content-active hover:tw-bg-teal-700 
                                tw-border-content-active hover:tw-border-teal-700 tw-text-xs tw-border-4 tw-text-black tw-py-1 tw-px-1 
                                tw-rounded" type="button"
                                >
                                Search
                                </button>
                                <button @click="clearQueryParams" 
                                class=" tw-flex tw-text-black tw-text-center hover:tw-text-content-active
                                hover:tw-text-content-active tw-text-xs tw-py-2 tw-px-1 tw-ml-2
                                " type="button"
                                >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                class="bi bi-x-square tw-mr-1" viewBox="0 0 16 16">
                                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 
                                2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 
                                .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 
                                8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                                Clear
                                </button>

                            </div>
                        </div>
                    </div>
                </template>

                <template v-slot:filter-bar-content>

                    <div class="tw-grid tw-grid-rows-6 tw-grid-cols-3 tw-grid-flow-col tw-mb-2">

                            <div class="tw-flex" v-for="(value, index) in filters" :key="value.id">
                                <combo-box
                                class="combo-box tw-w-4/12 t-mr-1 tw-text-black"
                                :data="summaryParameters"
                                textField="title"
                                valueField="valueField"
                                size="small"
                                :can-create-new-item="false"
                                v-model="value.selected"
                                :defaultText="value.title"
                                ></combo-box>

                                <combo-box v-if="value.inputtype == 'combo-box'"
                                class="combo-box tw-w-3/12 tw-mr-1"
                                :data="value.data"
                                :textField="value.textField"
                                :valueField="value.valueField"
                                size="small"
                                :can-create-new-item="false"
                                v-model="value.selected"
                                defaultText='Select Value'
                                ></combo-box>

                                <combo-box v-if="value.inputtype == 'search-operands'"
                                class="combo-box tw-w-2/12 tw-mr-1"
                                :data="operands"
                                textField="title"
                                valueField="value"
                                size="small"
                                :can-create-new-item="false"
                                v-model="value.operand"
                                defaultText='Select Operand'
                                ></combo-box>

                                <combo-box v-if="value.inputtype == 'search-operands'"
                                class="combo-box tw-w-1/12 tw-mr-1"
                                :data="orderby"
                                textField="title"
                                valueField="value"
                                size="small"
                                :can-create-new-item="false"
                                v-model="value.order"
                                defaultText='Select Value'
                                ></combo-box>

                                <input  v-if="value.inputtype == 'search-operands'"
                                v-model="value.value"
                                class="tw-w-2/12"
                                >

                                <button v-if="value.textField != 'PROP'" v-on:click="popFilter(index)" 
                                        class="fa fa-times tw-text-black tw-ml-1"></button>
                                
                            </div>
                            <div class="button_plus tw-h-3 tw-mt-2" v-if="filters.length < 18" v-on:click="addFilterOption($event)"></div>


                    </div>
                    

                </template>
            </expandable-sidebar>
        </div>





        
        <div class="tw-grid tw-grid-cols-2 gap-8">
            <div class="tw-flex">
                <div class="tw-mt-10 tw-items-center">   
                    <label for="simple-search" class="sr-only">Search</label>
                    <div class="tw-relative tw-w-full">
                        <input 
                        v-on:keyup.enter="onPrefixSearch" 
                        v-model = "tempSamplePrefix"
                        type="text" id="simple-search" 
                        class="tw-pl-6 tw-px-4 tw-border focus:tw-outline-none focus:tw-shadow-outline"
                        placeholder="Search..." required>

                        <button 
                            v-on:click="onPrefixSearch"
                            class="tw-flex tw-absolute tw-inset-y-0 tw-right-0 tw-items-center tw-ml-3 tw-p-1"
                                :class="{
                            'tw-bg-content-active': isLoading,
                            'tw-bg-content-sub-header-background tw-text-white': !isLoading,
                            }">
                            <svg aria-hidden="true" class="tw-w-5 tw-h-5 tw-text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                </div>
                <!-- <button
                    v-on:click="getFavourites"
                    class="tw-mt-10 tw-items-center tw-block tw-pl-5 tw-pr-5 tw-h-6 tw-ml-2
                    tw-shadow tw-text-xs
                    tw-rounded-full tw-shadow" 
                    :class="{
                    'tw-bg-content-active': showFavourites,
                    'tw-bg-content-sub-header-background tw-text-white': !showFavourites,
                    }" type="button">
                    <p>Favourites</p></button> -->
                <button
                    v-on:click="downloadFile"
                    class="tw-mt-10 tw-items-center tw-block tw-pl-5 tw-pr-5 tw-h-6 tw-ml-2 tw-mr-2 
                    tw-text-white tw-bg-content-sub-header-background tw-shadow tw-text-xs
                    tw-rounded tw-shadow" type="button">
                    <p>Export CSV</p></button>
            </div>

        </div>


        <div v-if="isLoading" role="status">
                <svg class="status tw-text-teal-200 tw-fill-current tw-animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                        </path>
                    </svg>
                <span class="sr-only">Loading...</span>
        </div>

        <div class="results-wrapper tw-bg-table-header-background tw-text-table-header-color tw-mt-2 tw-overflow-x-scroll tw-scrolling-touch">

            <div class="tw-font-bold tw-grid tw-grid-col-20 tw-grid-flow-col">
                <div></div>
                <div class="results-item tw-pt-3 tw-px-5"> File Template</div>
                <div class="results-item tw-pt-3 tw-px-5"> Sample Name</div>

                
                <div v-for="value in summaryParameters" :key="value.id"
                class="results-item tw-pt-3 tw-px-5">
                {{ value.title }}</div>

            </div>

            <div class="results-content tw-text-black tw-text-center tw-pt-3 tw-px-5 tw-text-xl tw-bg-content-sub-header-hover-background" v-if="summaryData.length == 0">
                    No Results</div>

            <expandable-sidebar
            class="results-content"
            v-else v-for="value in summaryData" :key="value.id">
                <template v-slot:filter-bar-title >
                    <div class="tw-grid tw-grid-col-20 tw-grid-flow-col tw-text-black">
                        <div class="tw-ra tw-ml-1 ">
                                <a :href="'/dc/visit/' + value.PROP + '-' + value.VISIT_NUMBER
                                + '/id/' + value.DATACOLLECTIONID" class="tw-button tw-button-notext tw-dll" title="Go to Data Collection">
                                <i class="search-icon fa fa-search"></i></a>
                        </div>
                        <!-- <button class="tw-ra tw-ml-1" title="Click to add this data collection to the list of favourite data collections"
                                    @click="favourite(result)">

                                <i v-if=!isFavourite(result) class="fa fa-star-o"></i>
                                <i v-if=isFavourite(result) class="fa fa-star"></i>
                            </button>
                            <p class="tw-ra tw-ml-1 ">
                                <a :href="'/dc/visit/' + result.PROP + '-' + result.VISIT_NUMBER
                                + '/id/' + result.DATACOLLECTIONID" class="tw-button tw-button-notext tw-dll" title="Go to Data Collection">
                                <i class="fa fa-search"></i></a>
                            </p>
                            <p class="tw-ra tw-ml-1">
                                <a href="'+app.apiurl+'/download/id/<%-DCID%>/aid/<%-AID%>" class="tw-button tw-button-notext tw-dll" 
                                    title="Download MTZ file"><i class="fa fa-download"></i></a>
                            </p> -->
                        <div class="results-item tw-px-5"> {{ getProcRow(value["FILETEMPLATE"], 'text')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["SAMPLENAME"], 'text')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["BEAMLINENAME"], 'text')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["SPACEGROUP"], 'text')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["PROCESSINGPROGRAMS"], 'text')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_A"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_B"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_C"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_ALPHA"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_BETA"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_GAMMA"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RESOLUTIONLIMITHIGHOUTER"], 'decimal4')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RMEASWITHINIPLUSIMINUSINNER"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RESIOVERSIGI2OVERALL"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["CCANOMALOUSINNER"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["CCANOMALOUSOVERALL"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RFREEVALUESTARTINNER"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RFREEVALUEENDINNER"], '')[0] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["NOOFBLOBS"], '')[0] }}</div>

                    </div>


                </template>

                <template v-slot:filter-bar-content> 
                    <div v-for="(col, index) in getProcRow(value.FILETEMPLATE, 'text') " :key="index" class="tw-grid tw-grid-col-20  tw-divide-y tw-grid-flow-col tw-text-black">
                        <div></div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["FILETEMPLATE"], 'text')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["SAMPLENAME"], 'text')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["BEAMLINENAME"], 'text')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["SPACEGROUP"], 'text')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["PROCESSINGPROGRAMS"], 'text')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_A"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_B"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_C"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_ALPHA"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_BETA"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["REFINEDCELL_GAMMA"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RESOLUTIONLIMITHIGHOUTER"], 'decimal4')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RMEASWITHINIPLUSIMINUSINNER"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RESIOVERSIGI2OVERALL"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["CCANOMALOUSINNER"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["CCANOMALOUSOVERALL"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RFREEVALUESTARTINNER"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["RFREEVALUEENDINNER"], '')[index] }}</div>
                        <div class="results-item tw-px-5"> {{ getProcRow(value["NOOFBLOBS"], '')[index] }}</div>
        

                    </div>

                </template>

            </expandable-sidebar>

        </div>


        <pagination-panel
        :initial-page=currentPage
        :totalRecords=totalRecords
        :pageLinks="10"
        @page-changed="handlePageChange"
        />


    </div>
</template>


<script>

import SummaryCollection from 'modules/summary/collections/summaryresults.js'
import ProposalCollection from 'collections/proposals'
import SpaceGroups from 'collections/spacegroups'
import ProcessingPipelines from 'collections/processingpipelines'

import Pagination from 'app/components/pagination.vue'

import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'
import ComboBox from 'app/components/combo-box.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from '../../../app/components/base-input-text.vue'

import ExpandableSidebar from '../../../app/components/expandable-sidebar.vue'
import CustomAccordian from '../../../app/components/custom-accordian.vue'


export default {

    name: 'Summary',
    components: {
    'custom-table-component': CustomTableComponent,
    'custom-table-row':CustomTableRow,
    'pagination-panel': Pagination,
    'combo-box': ComboBox,
    'expandable-sidebar': ExpandableSidebar,
    'custom-accordian': CustomAccordian,
    'base-input-select': BaseInputSelect,
    'base-input-text' : BaseInputText
    },
    props: {

    },
    data() {
        
        return {
            windowWidth: window.innerWidth,
            isLoading : false,
            isHidden: true,
            showFavourites: false,
            totalRecords:  10,
            pageSize: 15,
            currentPage: 1,
            summaryData : [],
            summaryExport : [],
            proposalCollection : null,
            proposals : [],
            spaceGroups : [],
            processingProgram : [],
            beamLines: [],
            searchedSamplePrefix: [],
            operands: [
                {   
                    "title": "greater than",
                    "value": ">"
                },
                {   
                    "title": "like",
                    "value": "LIKE"
                },
                {   
                    "title": "equal to",
                    "value": "="
                },
                {   
                    "title": "less than",
                    "value": "<"
                }
            ],
            orderby: [
                {   
                    "title": "desc",
                    "value": "DESC"
                },
                {   
                    "title": "asc",
                    "value": "ASC"
                },
            ],
            summaryParameters: [   
                {
                    "title": "Beamline",
                    "inputtype": "combo-box",
                    "textField": "BEAMLINENAME",
                    "valueField": "BEAMLINENAME",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "BEAMLINENAME="
                },
                {
                    "title": "Space Group",
                    "inputtype": "combo-box",
                    "textField": "SPACEGROUP",
                    "valueField": "SPACEGROUP",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "sg="
                },
                {
                    "title": "Processing Programs",
                    "inputtype": "combo-box",
                    "textField": "PROCESSINGPROGRAMS",
                    "valueField": "PROCESSINGPROGRAMS",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "pp="
                },     
                {
                    "title": "Refinedcell A",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_A",
                    "valueField": "REFINEDCELL_A",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rca="
                },
                
                {
                    "title": "Refinedcell B",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_B",
                    "valueField": "REFINEDCELL_B",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rcb="
                },
                
                {
                    "title": "Refinedcell C",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_C",
                    "valueField": "REFINEDCELL_C",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rcc="
                },
                
                {
                    "title": "Refinedcell α",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_ALPHA",
                    "valueField": "REFINEDCELL_ALPHA",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rcal="
                },
                
                {
                    "title": "Refinedcell β",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_BETA",
                    "valueField": "REFINEDCELL_BETA",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rcbe="
                },
                
                {
                    "title": "Refinedcell γ",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_GAMMA",
                    "valueField": "REFINEDCELL_GAMMA",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rcga="
                },
                
                {
                    "title": "Resolution Limit High (Outer)",
                    "inputtype": "search-operands",
                    "textField": "RESOLUTIONLIMITHIGHOUTER",
                    "valueField": "RESOLUTIONLIMITHIGHOUTER",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rlho="
                },
                
                {
                    "title": "Rmeas (Inner)",
                    "inputtype": "search-operands",
                    "textField": "RMEASWITHINIPLUSIMINUSINNER",
                    "valueField": "RMEASWITHINIPLUSIMINUSINNER",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rmpmi="
                },
                
                {
                    "title": "Resolution I/sig(I)=2 (Overall)",
                    "inputtype": "search-operands",
                    "textField": "RESIOVERSIGI2OVERALL",
                    "valueField": "RESIOVERSIGI2OVERALL",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "riso="
                },
                
                {
                    "title": "CCanomalous (Inner)",
                    "inputtype": "search-operands",
                    "textField": "CCANOMALOUSINNER",
                    "valueField": "CCANOMALOUSINNER",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "cci="
                },
                
                {
                    "title": "CCanomalous (Overall)",
                    "inputtype": "search-operands",
                    "textField": "CCANOMALOUSOVERALL",
                    "valueField": "CCANOMALOUSOVERALL",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "cco="
                },
                
                {
                    "title": "RFree Value Start (Inner)",
                    "inputtype": "search-operands",
                    "textField": "RFREEVALUESTARTINNER",
                    "valueField": "RFREEVALUESTARTINNER",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rfsi="
                },
                
                {
                    "title": "RFree Value End (Inner)",
                    "inputtype": "search-operands",
                    "textField": "RFREEVALUEENDINNER",
                    "valueField": "RFREEVALUEENDINNER",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "rfei="
                },
                
                {
                    "title": "No of blobs",
                    "inputtype": "search-operands",
                    "textField": "NOOFBLOBS",
                    "valueField": "NOOFBLOBS",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "nobi="
                }
            ],

            filters: [
                {
                    "title": "Proposal",
                    "inputtype": "combo-box",
                    "textField": "PROP",
                    "valueField": "PROPOSALID",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "propid="
                },

            ],
        }
    },
    created() {
        this.searchProposal()
        this.getSpaceGroups()
        this.getProcessingPipelines() 
        this.getBeamLine()
        // this.populateSelectedColumns()
    },
    mounted() {
        window.onerror = (msg) => {
            alert('Error message: '+msg);
            return true;
        }
        window.addEventListener('resize', () => {
            this.windowWidth = window.innerWidth;
        })
    },
    methods: {
        addFilterOption(event) {

            if (this.filters.length < 18) {
                this.filters.push(
                    {
                    "title": "",
                    "inputtype": "",
                    "textField": "",
                    "valueField": "",
                    "order": "",
                    "selected": "",
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : ""
                    }
                )
            } 

        },
        popFilter(value) {
            this.filters.splice(value, 1)
        },
        async searchProposal() {

            // gets proposal list for combo box from proposal collection 
            try {

                this.isLoading = true;

                const results = await this.$store.dispatch('fetchDataFromApi', {
                  url: '/summary/proposal?page=1&per_page=9999',
                  requestType: 'fetching proposals'
                })

                const index = this.filters.findIndex((dict) => dict["textField"] == "PROP");
                this.filters[index].data = results;


                this.isLoading = false;

            } catch(e) {

                window.onerror('Cannot get Proposals Collection: ' + e);
                this.isLoading = false;
                return ;

            }


        },
        async getSpaceGroups() {
            // gets space group list for combo box from space group collection 
            try {
                this.isLoading = true;

                const results = await this.$store.dispatch('fetchDataFromApi', {
                  url: '/summary/spacegroup?',
                  requestType: 'fetching pspacegroups'
                })

                const index = this.summaryParameters.findIndex((dict) => dict["textField"] == "SPACEGROUP");
                this.summaryParameters[index].data = results;                

                this.isLoading = false;
                 
            } catch (e) {

                window.onerror('Cannot get space group collection: ' + e);
                this.isLoading = false;
                return ;


            }
        },
        async getProcessingPipelines() {
            // gets processing pipelines list for combo box from processing pipeline collection 
            try {
                this.isLoading = true;

                const results = await this.$store.dispatch('fetchDataFromApi', {
                  url: '/summary/procprogram?',
                  requestType: 'fetching processingprograms'
                })

                const index = this.summaryParameters.findIndex((dict) => dict["textField"] == "PROCESSINGPROGRAMS");
                this.summaryParameters[index].data = results;  

                this.isLoading = false;
                 
            } catch (e) {

                window.onerror('Cannot get processing pipeline collection: ' + e);
                this.isLoading = false;
                return ;

            }
        },
        async getBeamLine() {
            // gets processing pipelines list for combo box from processing pipeline collection 
            try {
                this.isLoading = true;

                const results = await this.$store.dispatch('fetchDataFromApi', {
                  url: '/summary/bl?',
                  requestType: 'fetching beamlinename'
                })

                const index = this.summaryParameters.findIndex((dict) => dict["textField"] == "BEAMLINENAME");
                this.summaryParameters[index].data = results;  

                this.isLoading = false;
                 
            } catch (e) {

                window.onerror('Cannot get processing pipeline collection: ' + e);
                this.isLoading = false;
                return ;

            }
        },
        async searchFilterParams() {
          // searches for results with filter parameters applied which is in getQueryParams
            try {

                 
                this.isLoading = true;

                this.currentPage = 1;

                const queryParams = this.getQueryParams(false);

                console.log(encodeURI(queryParams))

                const results = await this.$store.dispatch('fetchDataFromApi', {
                  url: '/summary/results?'+encodeURI(queryParams),
                  requestType: 'fetching beamlinename'
                })

                console.log('results', results)

                this.totalRecords = results.total;
                this.summaryData = results.data;


                this.isLoading = false;

            } catch(e) {

                window.onerror('Cannot get filtered results: ' + e);
                this.isLoading = false;
                return ;

            }

        },
        async handlePageChange(data) {
          // searches for results where pagination is handled in the backend with the pageSize and currentPage parameters. Also takes into account current 
          //   filter params
            try {

                this.isLoading = true;

                this.currentPage = data['current-page'];
                this.pageSize = data['page-size'];

                const queryParams = this.getQueryParams(false);

                const results = await this.$store.dispatch('fetchDataFromApi', {
                  url: '/summary/results?'+encodeURI(queryParams),
                  requestType: 'fetching beamlinename'
                })

                console.log('results', results)

                this.summaryData = results.data;


                this.isLoading = false;

            } catch(e) {

                window.onerror('Cannot go to selected page: ' + e);
                this.isLoading = false;
                return ;
                
            }

        },
        async downloadFile() {
          // downloads all results (not page by page) whilst taking into account current filter params.  
            try {
                console.log('download')


                    const queryParams = this.getQueryParams(true);


                    const results = await this.$store.dispatch('fetchDataFromApi', {
                        url: '/summary/results?'+encodeURI(queryParams),
                        requestType: 'fetching beamlinename'
                        })

                    this.summaryExport = results.data;

                    const csv = this.convertToCSV(this.summaryExport);
                    this.exportCSV(csv);

                    this.summaryExport = [];

            } catch(e) {
                
                window.onerror('Cannot download csv: ' + e);
                return ;
                
            }

        },
        async favourite(result) {
            // adds favourites by adding a _FLAG_ comment to DataCollection comments table. updatetype is always specified as a 'POST' rather than 'PATCH' due to some errors in 
            // api not pushing data to 'patch' endpoint. if patching the endpoint we point to dc/patchcomments, which will patch (UPDATE) through sql code. 
            try {
                // var dispatchUrl = '/dc/patchcomments';

                // if(result.DC_COMMENTS == null) {
                //     result.DC_COMMENTS = '';

                //     dispatchUrl = '/dc/comments';
                // }

                // result.DC_COMMENTS = this.isFavourite(result) ?
                //             result.DC_COMMENTS.replace('_FLAG_','').trim() :
                //             result.DC_COMMENTS.trim() + ' _FLAG_'


                // await this.$store.dispatch('updateDataToApi', {
                //     url: dispatchUrl,
                //     updateType: 'POST',
                //     data: {
                //         DATACOLLECTIONID: Number(result.DATACOLLECTIONID),
                //         PERSONID: Number(result.PERSONID),
                //         COMMENTS: result.DC_COMMENTS
                //     },
                //     requestType: 'updating comment for dc favourites'
                // }).then(
                //     (response) => {
                //         console.log('favourited!')
                //     }
                // )

            }
            catch (e) {

                window.onerror('Cannot favourite: ' + e);
                return ;
            
            }
        },
        async getFavourites() {
        // gets favourites based on whether the DataCollection comments table contains _FLAG_ in its comments.  
            try{
                // this.showFavourites = !this.showFavourites;

                // if (this.showFavourites) {
                // this.isLoading = true;

                // this.summaryCollection = new SummaryCollection();

                // this.summaryCollection.queryParams = { page: this.currentPage, per_page: this.pageSize };

                // this.summaryCollection.queryParams.com = "_FLAG_";

                // if (this.selectedProposal) {
                //     this.summaryCollection.queryParams.prop = this.selectedProposal;
                // }

                // const results = await this.$store.dispatch('getCollection', this.summaryCollection);

                // this.totalRecords = results.state.totalRecords;
                // this.summaryData = results.toJSON();

                // this.mapSummaryResults()

                // this.isLoading = false;

                // }else {
                //     this.searchFilterParams();
                // }

            } catch(e) {

                window.onerror('Cannot get favourites: ' + e);
                this.isLoading = false;
                return ;

            }

        },
        isFavourite(result) {
            // if(!result.DC_COMMENTS) {
            //     return false;
            // };
            // return result.DC_COMMENTS.includes('_FLAG_');
        },
        getQueryParams(isexport) {
        // gets query params from summaryColumns or standalone variables i.e. selected Proposal etc. if this is an export then the pageSize will be for total records
        // rather than what is specified by the front page spinner. 
            console.log('getqueryparams')

            var queryParams = [];

            queryParams.push('page='+this.currentPage)

            if (isexport) {
                queryParams.push('&per_page='+this.totalRecords)
            } else {
                queryParams.push('&per_page='+this.pageSize)
            }


            for (var i in this.filters) {

                queryParams.push('&')

                console.log(this.filters[i])

                queryParams.push(this.filters[i].arg)

                if (this.filters[i].inputtype == "combo-box") {
                    queryParams.push(this.filters[i].selected)
                } else {
                    queryParams.push(this.filters[i].value)
                    queryParams.push(","+this.filters[i].operand)
                }

                if (this.filters[i].order) {
                    queryParams.push(","+this.filters[i].order)
                }

            }

            if (this.searchedSamplePrefix != '') {
                queryParams.push('&'+'sample='+this.searchedSamplePrefix)
            }


            return queryParams.join("")

 
        },
        clearQueryParams() {

            console.log('clear!')

            this.searchedSamplePrefix = ''

            for (var index in this.filters) {
                if (this.filters[index].textField !== "PROP") {
                    this.filters[index].selected = ''
                    this.filters[index].operand = ''
                    this.filters[index].value = ''

                }
 
            };
            
        },
        onPrefixSearch() {

            this.searchedSamplePrefix = this.tempSamplePrefix;
            this.searchFilterParams();

        },  
        convertToCSV(data) {

            const result = [
                // headers
                Object.keys(data['0']),
                // values
                ...Object.values(data).map(item => Object.values(item))
            ]
                .reduce((string, item) => {
                    string += item.join(',') + '\n';
                    return string;
            }, '');

            return result;
        },
        exportCSV(csv) {

            const anchor = document.createElement('a');
            anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            anchor.target = '_blank';
            anchor.download = 'summary_export.csv';
            anchor.click();

        },
        getProcRow(result, type) {
            // return an array for results, also change decimal places for floats
                if (result) {

                    var dataArray = result.split(",");

                    if( type !== 'text') {
                        if(type == 'decimal4') {
                            return dataArray.map(function (x) { 
                                return parseFloat(x).toFixed(4);
                             });
                        } else {
                            return dataArray.map(function (x) { 
                                return parseFloat(x).toFixed(2);
                             });
                        }
                    };
                        

                    return dataArray;
                }
                else {
                    return [];
                };
        },



    },
    computed: {

    },
    watch: {
        filters: {
            handler(val){
                console.log(this.filters)
                for (var i in this.filters) {

                    let keyToCompare = this.filters[i].selected;

                    // Check if there is a matching dictionary in the second array
                    let matchingDict = this.summaryParameters.find((dict2) => dict2.valueField === keyToCompare);

                    if (matchingDict) {
                        // Replace values in dict1 with corresponding values from matchingDict
                        for (let key in matchingDict) {
                            if (this.filters[i].hasOwnProperty(key)) {
                                this.filters[i][key] = matchingDict[key];
                            }
                        }
                    }
                }
            },
            deep: true
        },
    }

    
}

</script>

<style>

.results-content .transform-filter-height {
    height: 70px;
}

.select-selected {
    font-size: small;
    @apply tw-box-content;
}


</style>

<style scoped>

.search-icon {
    font-size: 12px;
}

.combo-box {
    font-size: small;
}

.copied {
    height: 125px;
    width: 75px;
    justify-content: center;
    align-items: center;
    display: flex;
    position: fixed;
    top: 20%;
    left: 50%;
}

.status {
    height: 125px;
    width: 75px;
    justify-content: center;
    align-items: center;
    display: flex;
    position: fixed;
    top: 45%;
    left: 50%;
}

.proposal-select {
    color: black;
    height: 10px;
}



.button_plus {
  position: relative;
  width: 25px;
  height: 25px;
  background: #fff;
  cursor: pointer;
  border: 2px solid #5a5a5a;

  margin-left: 50%;

}

.button_plus:after {
  content: '';
  position: absolute;
  transform: translate(-50%, -50%);
  height: 4px;
  width: 50%;
  background: #5a5a5a;
  top: 50%;
  left: 50%;
}

.button_plus:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #5a5a5a;
  height: 50%;
  width: 4px;
}

.button_plus:hover:before,
.button_plus:hover:after {
  background: #fff;
  transition: 0.2s;
}

.button_plus:hover {
  background-color: #5a5a5a;
  transition: 0.2s;
}

::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: black;
  opacity: 1; /* Firefox */
  font-size: small;
}

:-ms-input-placeholder { /* Internet Explorer 10-11 */
  color: black;
  font-size: small;
}

::-ms-input-placeholder { /* Microsoft Edge */
  color: black;
  font-size: small;
}

.results-wrapper{
    overflow-x: scroll;
}

.results-content{
    overflow: visible; 
    min-width:max-content;
    display:block;
}



.results-item{
    width:130px;
    display:inline-block;
    text-overflow: ellipsis;
    word-break: break-all;
    overflow:hidden;
    white-space: nowrap;
    font-size:small;
}

.results-item:hover {
    overflow: visible; 
    white-space: normal;
    height:auto; 
}
/* @apply tw-truncate tw-text-sm tw-pr-5 */
</style>

