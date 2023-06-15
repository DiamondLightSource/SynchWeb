<template>
    <div>

        <p class="tw-m-4 tw-p-4 tw-text-lg md:tw-text-2xl 
        tw-mx-auto tw-border-b tw-border-gray-500">
        Data Collection Summary</p>

        <div class="tw-mt-12 tw-mb-4">
            
        </div>


        <div>
            <i class="tooltip fa fa-info-circle" aria-hidden="true">
                <span class="tooltiptext">Use the Advanced Filter Search bar to filter your values</span>
            </i>

            <expandable-sidebar :isOpen="isOpen">
                <template v-slot:filter-bar-title> 
                    <div class="tw-grid tw-grid-cols-5">
                        <div class="tw-flex tw-col-span-1 tw-mt-3 tw-ml-3">
                            <i class="fa fa-filter tw-mb-1 tw-mr-2"></i>
                            <h> Filter </h>
                        </div>
                        <div class="tw-flex tw-col-span-2 tw-col-start-2 tw-mt-3 tw-ml-3">
                            <combo-box
                                class="combo-box tw-w-4/12 t-mr-1 tw-mb-2 tw-text-black"
                                :data="propSelect"
                                textField="title"
                                valueField="valueField"
                                size="small"
                                :can-create-new-item="false"
                                v-model="filters[0].selected"
                                :defaultText="filters[0].title"
                            ></combo-box>
                            <combo-box v-if="filters[0].inputtype == 'combo-box'"
                                class="combo-box tw-w-7/12 tw-mr-1 tw-mb-2"
                                :data="filters[0].data"
                                :textField="filters[0].textField"
                                :valueField="filters[0].valueField"
                                size="small"
                                :can-create-new-item="false"
                                v-model="filters[0].selected"
                                defaultText='Select Operand'
                                :multiple="true"
                                :valueArray="filters[0].selectedArr"
                                :searchArray="filters[0].selectedArr"
                                ></combo-box>
                        </div>
                        <div class="tw-col-span-1 tw-col-start-6 tw-mt-2 tw-mr-3 ">

                            <div class="tw-flex tw-mb-2">
                                <button class="sidebar-button tw-mr-1" @click="toggleSidebar()">Advanced Filter</button>
                                <button class="sidebar-button" @click="searchFilterParams" >
                                Search
                                </button>
                                <button class="clear-button" @click="clearQueryParams" >
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

                    <div class="filter-grid">

                            <div class="tw-flex" v-for="(value, index) in filters.slice(2)" :key="value.id">
                                <combo-box
                                v-if="value.title!='Proposal'"
                                class="combo-box tw-w-4/12 t-mr-1 tw-text-black"
                                :data="summaryParameters"
                                textField="title"
                                valueField="valueField"
                                size="small"
                                :can-create-new-item="false"
                                v-model="value.selected"
                                :defaultText="value.title"
                                ></combo-box>

                                <combo-box v-if="value.inputtype == 'combo-box' & value.title != 'Proposal'"
                                class="combo-box tw-w-7/12 tw-mr-1"
                                :data="value.data"
                                :textField="value.textField"
                                :valueField="value.valueField"
                                size="small"
                                :can-create-new-item="false"
                                v-model="value.selected"
                                defaultText='Select Operand'
                                :multiple="true"
                                :valueArray="value.selectedArr"
                                :searchArray="value.selectedArr"
                                ></combo-box>

                                <combo-box v-if="value.inputtype == 'search-operands'"
                                class="combo-box tw-w-3/12 tw-mr-1"
                                :data="operands"
                                textField="title"
                                valueField="value"
                                size="small"
                                :can-create-new-item="false"
                                v-model="value.operand"
                                defaultText='Select Operand'
                                ></combo-box>

                                <input  v-if="value.inputtype == 'search-operands'"
                                v-model="value.value"
                                class="tw-w-2/12"
                                >

                                <button v-if="value.textField != 'PROP'" v-on:click="popFilter(index+1)" 
                                        class="fa fa-times tw-text-black tw-ml-1"></button>
                                
                            </div>
                            <div class="button_plus tw-h-3 tw-mt-2" v-if="filters.length < 18" v-on:click="addFilterOption($event)">
                            </div>
                            <i class="tooltip tooltip-position fa fa-info-circle tw-absolute tw-top-0 tw-left-0" v-if="filters.length < 3" aria-hidden="true">
                            <span class="tooltiptext">Click to add filter options</span>
                            </i>


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
                        class="simple-search"
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
                    class="download-file" type="button">
                    <p>Export CSV</p></button>
            </div>

            <div>
                <div class="tw-flex tw-mt-2">
                <p class="tw-text-content-sub-header-background tw-ml-2">Select Columns</p>
                <i class="tooltip fa fa-info-circle tw-ml-2" aria-hidden="true">
                <span class="tooltiptext">Toggle column visibility using the select columns drop down</span>
                 </i>
                </div>
                <div class="tw-py-2 tw-px-6 tw-border tw-rounded-lg tw-border-content-sub-header-background">
                    <div class="tw-relative tw-w-full">
                        <button v-on:click="isHidden = !isHidden" id="dropdownInformationButton" data-dropdown-toggle="dropdown" 
                        class="tw-h-8 tw-text-white tw-rounded tw-text-xs tw-px-4 tw-text-center tw-inline-flex tw-items-center 
                        tw-bg-content-sub-header-background tw-border-content-sub-header-background tw-border-4 
                        tw-text-black tw-py-1 tw-px-5" type="button"> Select Columns </button>

                        <div id="dropdown" class="tw-absolute
                        tw-w-44 tw-bg-white tw-rounded tw-divide-y tw-divide-gray-100 tw-shadow
                        tw-transition tw-ease-out tw-duration-100"
                        :class="isHidden ? 'tw-transform tw-opacity-0 tw-scale-95 tw-z-20' : 'tw-transform tw-opacity-100 tw-scale-100 tw-z-50'">
                        
                            <ul class="tw-py-1 tw-text-sm tw=text-gray-700" aria-labelledby="dropdownInformationButton">
                            <li> 
                                <div v-for="(value, index) in summaryParameters" :key="value.id" 
                                class="tw-flex tw-items-center tw-ml-2">
                                    <input checked
                                    v-model="value.checked"
                                    v-if="!isHidden"
                                    @click="checkedColumns(index)"
                                    id="default-checkbox" type="checkbox" value="" 
                                    class="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-rounded 
                                    tw-border-gray-300 focus:tw-ring-blue-500 focus:tw-ring-2">
                                    <a class="tw-block tw-text-xs tw-py-2 tw-px-4 hover:tw-bg-gray-100"> {{ value.title }} </a>

                                </div>
                            </li>
                            </ul>

                        </div>

                        <div class="tw-absolute tw-right-0 tw-top-0"> 
                            <ul v-if="windowWidth > 900" class="tw-flex">
                                <div v-for="(title, index) in selectedColumns" :key="title.id">
                                    <p v-if="index <= pillIndex && title.checked == true"
                                    class="tw-rounded-full tw-h-6 tw-max-w-xs tw-ml-1 tw-pt-1 
                                    tw-pr-1 tw-pl-1 tw-bg-content-active ">
                                    <button v-on:click="togglePills(title.title)" class="fa fa-times tw-text-black"></button>
                                    {{ title.title }} </p>

                                </div>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>

        </div>


        <div v-if="isLoading" role="status">
                <svg class="status tw-fill-current tw-animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                        </path>
                    </svg>
                <span class="sr-only">Loading...</span>
        </div>



        <div class="results-wrapper tw-bg-table-header-background tw-text-table-header-color tw-mt-2 tw-overflow-x-scroll tw-scrolling-touch">

            <div class="results-grid tw-font-bold ">
                <!-- <div></div> -->
                <div class="results-item tw-px-5 tw-my-3"> File Template</div>
                <div class="results-item tw-px-5 tw-my-3"> Sample Name</div>
                
                <div v-for="(value, index) in selectedColumns" :key="value.id"
                class="results-item tw-px-5 tw-my-3">
                        <p class="results-content-child tw-mr-1">{{ value.title }}</p>
                        <div>
                            <svg    
                            @click="orderBy(index)"
                            v-if="value.order!=''"
                            class="order-by tw-transition-all tw-duration-200 tw-transform"
                            :class="{
                            'tw-rotate-180': value.order == 'ASC',
                            'tw-rotate-0': value.order == 'DESC',
                            }"
                            fill="none"
                            stroke="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 10"
                            aria-hidden="true"
                            >
                            <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 
                            .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                            </svg>
                        
                            <svg
                            @click="orderBy(index)"
                            v-if="value.order==''"
                            class="order-by tw-transition-all tw-duration-200 tw-transform"
                            fill="none"
                            stroke="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 10"
                            aria-hidden="true"
                            >
                            <path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 
                            0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 
                            4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/>
                            </svg>
                        </div>
                        
                    </div>

            </div>



            <div class="results-content tw-text-black tw-text-center tw-pt-3 tw-px-5 tw-text-xl tw-bg-content-sub-header-hover-background" v-if="summaryData.length == 0">
                    No Results</div>

                                

            <expandable-sidebar
            class="results-content tw-flex" v-click="true"
            :disable-clickable-sidebar="false"
            v-else v-for="(value,index) in summaryData" :key="value.id">
                <template v-slot:filter-bar-title >


                        <a class="tiptext-preview fa fa-eye" @mouseover="renderIFrame(index)">
                            <iframe ref='iframeref' class="description" :srcdoc='baseUrl+"/dc/visit/" + value.PROP + "-" + value.VISIT_NUMBER
                                    + "/id/" + value.DATACOLLECTIONID'></iframe>
                        </a>


                        <div class="dc-nav tw-ra ">
                                <a :href="'/dc/visit/' + value.PROP + '-' + value.VISIT_NUMBER
                                + '/id/' + value.DATACOLLECTIONID" class="tw-button tw-button-notext tw-dll" title="Go to Data Collection">
                                <i class="search-icon  fa fa-search"></i>
                                </a>

                        </div>



                    <div class="results-grid tw-text-black">


 
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
                        
                        <div class="results-item results-content-child tw-px-5 tw-mt-2 tw-my-2"> {{ getProcRow(value, "FILETEMPLATE", 'text')[0] }}</div>
                        <div class="results-item results-content-child tw-px-5 tw-mt-2 tw-my-2"> {{ getProcRow(value, "SAMPLENAME", 'text')[0] }}</div>
                        <div class="results-item results-content-child tw-px-5 tw-mt-2 tw-my-2" v-for="data in selectedColumns" :key="data.id">{{ getProcRow(value, data.textField, 'text')[0] }}
                        </div>

                    </div>

                </template>

                <template v-slot:filter-bar-content> 
                    <div v-for="(col, index) in getProcRow(value, 'FILETEMPLATE', 'text') " :key="index" class="results-grid  tw-divide-y tw-text-black">
                        <!-- <div></div> -->
                        <div class="results-item results-content-child tw-px-3 tw-mt-2 tw-my-2"> {{ getProcRow(value, "FILETEMPLATE", 'text')[index] }}</div>
                        <div class="results-item results-content-child tw-px-3 tw-mt-2 tw-my-2"> {{ getProcRow(value, "SAMPLENAME", 'text')[index] }}</div>
                        <div class="results-item results-content-child tw-px-3 tw-mt-2 tw-my-2" v-for="data in selectedColumns" :key="data.id">{{ getProcRow(value, data.textField, 'text')[index] }}</div>

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
            baseUrl: window.location.origin,
            isLoading : false,
            isHidden: true,
            isOpen: true,
            showFavourites: false,
            totalRecords:  10,
            pageSize: 15,
            currentPage: 1,
            pillIndex: 2,
            summaryData : [],
            summaryExport : [],
            proposalCollection : null,
            proposals : [],
            spaceGroups : [],
            propSelect: [],
            processingProgram : [],
            beamLines: [],
            searchedSamplePrefix: [],
            selectedColumns: [],
            deselectedColumns: [],
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
            summaryParameters: [   
                {
                    "title": "Beamline",
                    "inputtype": "combo-box",
                    "textField": "BEAMLINENAME",
                    "valueField": "BEAMLINENAME",
                    "arg": "BEAMLINENAME=",
                    "type": "text"
                },
                {
                    "title": "Space Group",
                    "inputtype": "combo-box",
                    "textField": "SPACEGROUP",
                    "valueField": "SPACEGROUP",
                    "arg" : "sg=",
                    "type": "text"
                },
                {
                    "title": "Processing Programs",
                    "inputtype": "combo-box",
                    "textField": "PROCESSINGPROGRAMS",
                    "valueField": "PROCESSINGPROGRAMS",
                    "arg" : "pp=",
                    "type": "text"
                },     
                {
                    "title": "Refinedcell A",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_A",
                    "valueField": "REFINEDCELL_A",
                    "arg" : "rca=",
                    "type": ""
                },
                
                {
                    "title": "Refinedcell B",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_B",
                    "valueField": "REFINEDCELL_B",
                    "arg" : "rcb=",
                    "type": ""
                },
                
                {
                    "title": "Refinedcell C",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_C",
                    "valueField": "REFINEDCELL_C",
                    "arg" : "rcc=",
                    "type": ""
                },
                
                {
                    "title": "Refinedcell α",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_ALPHA",
                    "valueField": "REFINEDCELL_ALPHA",
                    "arg" : "rcal=",
                    "type": ""
                },
                
                {
                    "title": "Refinedcell β",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_BETA",
                    "valueField": "REFINEDCELL_BETA",
                    "arg" : "rcbe=",
                    "type": ""
                },
                
                {
                    "title": "Refinedcell γ",
                    "inputtype": "search-operands",
                    "textField": "REFINEDCELL_GAMMA",
                    "valueField": "REFINEDCELL_GAMMA",
                    "arg" : "rcga=",
                    "type": ""
                },
                
                {
                    "title": "Resolution Limit High (Outer)",
                    "inputtype": "search-operands",
                    "textField": "RESOLUTIONLIMITHIGHOUTER",
                    "valueField": "RESOLUTIONLIMITHIGHOUTER",
                    "arg" : "rlho=",
                    "type": "decimal4"
                },
                
                {
                    "title": "Rmeas (Inner)",
                    "inputtype": "search-operands",
                    "textField": "RMEASWITHINIPLUSIMINUSINNER",
                    "valueField": "RMEASWITHINIPLUSIMINUSINNER",
                    "arg" : "rmpmi=",
                    "type": ""
                },
                
                {
                    "title": "Resolution I/sig(I)=2 (Overall)",
                    "inputtype": "search-operands",
                    "textField": "RESIOVERSIGI2OVERALL",
                    "valueField": "RESIOVERSIGI2OVERALL",
                    "arg" : "riso=",
                    "type": ""
                },
                
                {
                    "title": "CCanomalous (Inner)",
                    "inputtype": "search-operands",
                    "textField": "CCANOMALOUSINNER",
                    "valueField": "CCANOMALOUSINNER",
                    "arg" : "cci=",
                    "type": ""
                },
                
                {
                    "title": "CCanomalous (Overall)",
                    "inputtype": "search-operands",
                    "textField": "CCANOMALOUSOVERALL",
                    "valueField": "CCANOMALOUSOVERALL",
                    "arg" : "cco=",
                    "type": ""
                },
                
                {
                    "title": "RFree Value Start (Inner)",
                    "inputtype": "search-operands",
                    "textField": "RFREEVALUESTARTINNER",
                    "valueField": "RFREEVALUESTARTINNER",
                    "arg" : "rfsi=",
                    "type": ""
                },
                
                {
                    "title": "RFree Value End (Inner)",
                    "inputtype": "search-operands",
                    "textField": "RFREEVALUEENDINNER",
                    "valueField": "RFREEVALUEENDINNER",
                    "arg" : "rfei=",
                    "type": ""
                },
                
                {
                    "title": "No of blobs",
                    "inputtype": "search-operands",
                    "textField": "NOOFBLOBS",
                    "valueField": "NOOFBLOBS",
                    "arg" : "nobi=",
                    "type": ""
                }
            ],

            filters: [
                {
                    "title": "Proposal",
                    "inputtype": "combo-box",
                    "textField": "PROP",
                    "valueField": "PROPOSALID",
                    "selected": "",
                    "selectedArr": [],
                    "operand": "",
                    "value": "",
                    "data": [],
                    "arg" : "propid="
                }

            ],
        }
    },
    created() {
        this.mapSummaryParameters()
        this.createPropList()
        this.searchProposal()
        this.getSpaceGroups()
        this.getProcessingPipelines() 
        this.getBeamLine()
        this.populateSelectedColumns()
        this.addFilterOption()
        this.toggleSidebar()
        this.populateSelectedColumns()
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
        toggleSidebar() {
        this.isOpen = !this.isOpen;
        },
        createPropList() {
            this.propSelect = this.filters;
        },
        populateSelectedColumns() {
            

            for (const value of Object.entries(this.summaryColumns)) {
                this.selectedColumns.push(value[1].title);
            };

            this.selectedColumns.reverse();

        },
        mapSummaryParameters() {
            this.summaryParameters = 
            this.summaryParameters.map((e) => {  
            return { ...e, 
                "order": "",
                "selected": "",
                "selectedArr": [],
                "operand": "",
                "value": "",
                "checked": true,
                "data": [] };
        })
        console.log(this.summaryParameters)
        },
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
                    "selectedArr": [],
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
        async orderBy(index) {
            try {

                if (this.selectedColumns[index].order == '') {
                    this.selectedColumns[index].order = 'DESC'
                } else if (this.selectedColumns[index].order == 'DESC') {
                    this.selectedColumns[index].order = 'ASC'
                } else {
                    this.selectedColumns[index].order = ''
                }

                this.isLoading = true;

                const queryParams = this.getQueryParams(false);

                const results = await this.$store.dispatch('fetchDataFromApi', {
                url: '/summary/results?'+encodeURI(queryParams),
                requestType: 'fetching beamlinename'
                })

                console.log('results', results)

                this.summaryData = results.data;


                this.isLoading = false;
            } catch(e) {

                window.onerror('Cannot order selected parameter: ' + e);
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

                console.log('this-filters', this.filters[i])

                queryParams.push('&')


                queryParams.push(this.filters[i].arg)

                if (this.filters[i].inputtype == "combo-box") {
                    var queryArray = [];
                    for (var j in this.filters[i].selectedArr ) {
                        var textVal = this.filters[i].valueField
                        queryArray.push(this.filters[i].selectedArr[j][textVal]) 
                    }
                    queryParams.push('['+queryArray.toString()+']')
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
                    this.filters[index].selectedArr = []
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
        getProcRow(result, field, type) {
            // return an array for results, also change decimal places for floats
                console.log('getProcRow')
                if (result[field]) {

                    var dataArray = result[field].split(",");

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
        checkedColumns(index) {

            this.summaryParameters[index].checked = !this.summaryParameters[index].checked;

            if (this.summaryParameters[index].checked == false){

            this.deselectedColumns.push(this.summaryParameters[index]);
            this.selectedColumns = this.selectedColumns.filter(item => item !== this.summaryParameters[index]);
            }
            else {
            this.selectedColumns.push(this.summaryParameters[index]);
            this.deselectedColumns = this.deselectedColumns.filter(item => item !== this.summaryParameters[index]);

            }


        },
        resizePills() {
            // change number of pills visible based on width of window

            if (this.windowWidth > 1000 ) {
                this.pillIndex = 1;
            }

            if (this.windowWidth > 1200 ) {
                this.pillIndex = 2;
            }

            if (this.windowWidth > 1600 ) {
                this.pillIndex = 3;
            }

            if (this.windowWidth > 1800 ) {
                this.pillIndex = 4;
            }

            if (this.windowWidth > 2200 ) {
                this.pillIndex = 5;
            }

            if (this.windowWidth > 2800 ) {
                this.pillIndex = 6;
            }


        },
        togglePills(value) {

            for (var index in this.summaryParameters) {

                if (this.summaryParameters[index].title == value) {
                    this.summaryParameters[index].checked = false;
                    this.deselectedColumns.push(this.summaryParameters[index]);
                    this.selectedColumns = this.selectedColumns.filter(item => item !== this.summaryParameters[index]);
                }
   
            }

        },
        populateSelectedColumns() {
            

            for (const value of Object.entries(this.summaryParameters)) {
                this.selectedColumns.push(value[1]);
            };


        },
        renderIFrame(index) {
            var src = this.$refs.iframeref[index].srcdoc

            if (src) {
                this.$refs.iframeref[index].removeAttribute('srcdoc')
                this.$refs.iframeref[index].setAttribute('src', src)

            }

        }



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

.results-content .title-format {
    background-color: rgb(255, 255, 255);
}

.results-content .content-format {
    background-color: rgb(217, 217, 217);
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
    color: rgb(111, 213, 111);
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
    background-color: rgb(94, 94, 94);
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(20, 20fr);
    grid-auto-flow: column;
    grid-template-rows: 50px;
}

.results-grid-child {
    display:grid;
    grid-template-columns: 5fr 15fr;
    grid-auto-flow: column;
}


.results-content{
    overflow: visible; 
    min-width:max-content;
    display:block;
    background-color: rgb(255, 255, 255);
}

.results-item{
    /* min-width: 100px;
    max-width:130px; */
    height: 18px;
    width: 140px;
    display: flex;
}

.results-content-child {
    text-overflow: ellipsis;
    word-break: break-all;
    overflow:hidden;
    white-space: nowrap;
    font-size:small;
    font-family: Arial, Helvetica, sans-serif;

}


.results-content-child:hover {
    overflow: visible; 
    white-space: normal;
    height:auto; 
}

.order-by {
  cursor: pointer;
  position: relative;
  /* top: 60%; */
  content: "";
  width: 15px;
  height: 20px;
}


.sidebar-button {
    @apply tw-text-center tw-bg-content-active tw-border-content-active tw-text-xs tw-border-4 tw-text-black tw-py-1 tw-px-1 tw-rounded
}
.sidebar-button:hover {
    @apply tw-border-teal-700 tw-bg-teal-700
}

.clear-button {
    @apply tw-flex tw-text-black tw-text-center tw-text-xs tw-py-2 tw-px-1 tw-ml-2
}

.clear-button:focus {
    @apply tw-text-content-active tw-text-content-active
}

.filter-grid {
    @apply tw-grid tw-grid-rows-6 tw-grid-cols-3 tw-grid-flow-col tw-mb-2
}

.download-file {
    @apply tw-mt-10 tw-items-center tw-block tw-pl-5 tw-pr-5 tw-h-6 tw-ml-2 tw-mr-2 
                    tw-text-white tw-bg-content-sub-header-background tw-shadow tw-text-xs
                    tw-rounded tw-shadow
}

.simple-search {
    @apply tw-pl-6 tw-px-4 tw-border
}

.simple-search:focus {
    @apply tw-outline-none tw-shadow-outline
}

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  color: rgb(104, 104, 104); /* If you want dots under the hoverable text */
}

.tooltip-position {
    position: absolute;
    top: 60%;
    left: 25%;
}

/* Tooltip text */
.tooltip .tooltiptext {
  font-family: Arial, Helvetica, sans-serif;
  visibility: hidden;
  opacity: 0.9;
  width: 120px;
  background-color: rgb(25, 24, 24);
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}

.dc-nav {
    position: absolute;
    left: 9%;
    margin-bottom: 2px;
}

.tiptext-preview {
    position: absolute;
    left: 7.5%;
    font-size:small;
    display: inline-block;
    margin: 2em;
    cursor:pointer;
}

.description {
    display:none;
    position:absolute;
    left:50%;
    border:1px solid #000;
    width:400px;
    height:400px;
}

.tiptext-preview:hover .description {
    display:block;
}





</style>

