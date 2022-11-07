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


                    <div class="tw-grid tw-grid-cols-2 tw-gap-4">
                        <div class="tw-col-span-3 tw-mt-3 tw-ml-3">
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
                                class=" tw-flex tw-text-white tw-text-center hover:tw-text-content-active
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

                    <div class="tw-grid tw-grid-cols-3 tw-gap-2 tw-pb-2">

                    <custom-accordian class="tw-pt-6 tw-pb-6"> 
                        <template v-slot:title>
                        <span class="tw-text-base">Proposal</span>
                        </template>

                        <template v-slot:content>
                            <div class=" tw-flex tw-pb-2">
                            <combo-box
                            class="tw-w-5/12 proposal-select tw-text-black tw-ml-2"
                            :data="proposals"
                            textField="PROP"
                            valueField="PROP"
                            size="small"
                            :can-create-new-item="false"
                            v-model="selectedProposal"
                            defaultText=""
                            ></combo-box>
                            <p class="tw-italic tw-ml-2">Search for your <br>Proposal Number</p>
                            </div>
                        </template>
                    </custom-accordian>

                    </div>

                    
                    <div class="tw-grid tw-grid-cols-4 tw-grid-flow-col tw-gap-2">
                        
                        <div v-for="options in groupedOptions" :key=options.id class="tw-grid tw-grid-rows-5 tw-grid-flow-col tw-gap-2">

                            <custom-accordian class="tw-pt-6 tw-pb-6" v-for="value in options" :key="value.id">
                            <template v-slot:title>
                                <span class="tw-text-base">{{ value.title }}</span>
                            </template>
                            <template v-slot:content>

                                <div v-if="value.inputtype == 'greater-than-less-than'" class="tw-grid tw-grid-cols-2 tw-divide-x 
                                    tw-divide-gray-400 tw-pt-3 tw-pb-2">
                                    <div class="tw-space-y-1">
                                    <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                    hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                    focus:tw-shadow-outline"
                                    placeholder="Greater than"
                                    v-model="value.filteredGt">
                                    <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                    hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                    focus:tw-shadow-outline"
                                    placeholder="Less than"
                                    v-model="value.filteredLt">
                                    </div>
                                    <p class="tw-italic">Search for <br>{{ value.title }}</p>
                                </div>

                                <div v-if="value.inputtype == 'search-for-value'" class="tw-grid tw-grid-cols-2 tw-divide-x 
                                    tw-divide-gray-400 tw-pt-3 tw-pb-2">
                                    <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                    hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                    focus:tw-shadow-outline"
                                    placeholder="Type here"
                                    v-model="value.searchedValue">
                                    <p class="tw-italic">Search for <br> {{value.title}} </p>
                                </div>

                                <div v-if="value.inputtype == 'combo-box'" class="tw-flex tw-pb-2 tw-pl-2">
                                    <combo-box
                                    class="tw-w-5/12 tw-text-black "
                                    :data="value.data"
                                    :textField="value.textField"
                                    :valueField="value.valueField"
                                    size="small"
                                    @create-new-option="addSGCombo"
                                    v-model="value.selectedValue"
                                    :defaultText="value.selectedValue"
                                    ></combo-box>
                                    <p class="tw-italic tw-ml-2">Search for your <br>{{ value.title }}</p>
                                </div>
                                
                            </template>
                            </custom-accordian>

                        </div>

                    </div>

                    <div class="tw-pb-2 tw-pt-2">

                        <custom-accordian class="tw-pt-6 tw-pb-6 tw-w-10/12">
                            <template v-slot:title>
                            <span class="tw-text-base">Unit Cell</span>
                            </template>
                            <template v-slot:content>
                                <div class="tw-flex">
                                    <div class="tw-grid tw-grid-cols-2 tw-pt-3 tw-pb-2">
                                        <div class="tw-space-y-1">
                                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                            hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                            focus:tw-shadow-outline"
                                            placeholder="Greater than"
                                            v-model="searchedGtUnitCellA">
                                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                            hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                            focus:tw-shadow-outline"
                                            placeholder="Less than"
                                            v-model="searchedLtUnitCellA">
                                        </div>
                                        <p class="tw-italic">Filter for <br>Unit Cell A</p>
                                    </div>

                                    <div class="tw-grid tw-grid-cols-2 tw-pt-3 tw-pb-2">
                                        <div class="tw-space-y-1">
                                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                            hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                            focus:tw-shadow-outline"
                                            placeholder="Greater than"
                                            v-model="searchedGtUnitCellB">
                                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                            hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                            focus:tw-shadow-outline"
                                            placeholder="Less than"
                                            v-model="searchedLtUnitCellB">
                                        </div>
                                        <p class="tw-italic">Filter for <br>Unit Cell B</p>
                                    </div>

                                    <div class="tw-grid tw-grid-cols-2 tw-pt-3 tw-pb-2">
                                        <div class="tw-space-y-1">
                                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                            hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                            focus:tw-shadow-outline"
                                            placeholder="Greater than"
                                            v-model="searchedGtUnitCellC">
                                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                                            hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none 
                                            focus:tw-shadow-outline"
                                            placeholder="Less than"
                                            v-model="searchedLtUnitCellC">
                                        </div>
                                        <p class="tw-italic">Filter for <br>Unit Cell C</p>
                                    </div>
                                </div>
                                
                            </template>
                        </custom-accordian>

                    </div>
                    

                </template>
            </expandable-sidebar>
        </div>
        
        <div class="tw-grid tw-grid-cols-2 gap-8">
            <div class="tw-flex">
                <form class="tw-mt-10 tw-items-center">   
                    <label for="simple-search" class="sr-only">Search</label>
                    <div class="tw-relative tw-w-full">
                        <input 
                        v-on:keyup.enter="onPrefixSearch" 
                        v-model = "tempPrefix"
                        type="text" id="simple-search" 
                        class="tw-block tw-pl-10 tw-p-2.5 tw-appearance-none 
                        tw-text-gray-700 tw-bg-white tw-border 
                        hover:tw-border-gray-500 tw-px-4 tw-rounded-lg tw-shadow tw-leading-tight focus:tw-outline-none 
                        focus:tw-shadow-outline"
                        placeholder="Press Enter to Search Prefix" required>

                        <div class="tw-flex tw-absolute tw-inset-y-0 tw-left-0 tw-items-center tw-pl-3 tw-pointer-events-none">
                            <svg aria-hidden="true" class="tw-w-5 tw-h-5 tw-text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                        </div>
                    </div>
                </form>
                <button
                    v-on:click="downloadFile"
                    class="tw-mt-10 tw-items-center tw-block tw-pl-10 tw-pr-10 tw-ml-2 tw-appearance-none 
                    tw-text-white tw-bg-content-sub-header-background tw-border-content-sub-header-background 
                    tw-rounded-lg tw-shadow tw-leading-tight" type="button">
                    Export CSV</button>
            </div>


            <div>
                <p class="tw-text-content-sub-header-background tw-ml-2 tw-mt-2">Select Columns</p>
                <div class="tw-py-2 tw-px-6 tw-border tw-rounded-lg tw-border-content-sub-header-background">
                    <div class="tw-relative tw-w-full">

                        <button v-on:click="isHidden = !isHidden" id="dropdownInformationButton" data-dropdown-toggle="dropdown" 
                        class="tw-h-8 tw-text-white tw-rounded tw-text-xs tw-px-4 tw-text-center tw-inline-flex tw-items-center 
                        tw-bg-content-sub-header-background tw-border-content-sub-header-background tw-border-4 
                        tw-text-black tw-py-1 tw-px-5" type="button">( and {{ Math.max(0, selectedColumns.length - 3) }} others... ) </button>

                        <div id="dropdown" class="tw-absolute 
                        tw-z-10 tw-w-44 tw-bg-white tw-rounded tw-divide-y tw-divide-gray-100 tw-shadow
                        tw-transition tw-ease-out tw-duration-100"
                        :class="isHidden ? 'tw-transform tw-opacity-0 tw-scale-95' : 'tw-transform tw-opacity-100 tw-scale-100'">
                        
                            <ul class="tw-py-1 tw-text-sm tw=text-gray-700" aria-labelledby="dropdownInformationButton">
                            <li> 
                                <div v-for="(value, index) in summaryColumns" :key="value.id" 
                                class="tw-flex tw-items-center tw-ml-2">
                                    <input checked
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
                            <ul class="tw-flex">
                                <div v-for="(title, index) in selectedColumns" :key="title.id">
                                    <p v-if="index <= 2"
                                    class="tw-rounded-full tw-h-6 tw-max-w-xs tw-ml-1 tw-pt-1 
                                    tw-pr-1 tw-pl-1 tw-bg-content-active "> {{ title }} </p>
                                </div>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div v-if="isLoading == true" role="status">
                <svg class="status tw-absolute tw-text-teal-200 tw-fill-current tw-animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                        </path>
                    </svg>
                <span class="sr-only">Loading...</span>
        </div>

        <div class="tw-overflow-x-scroll tw-scrolling-touch tw-z-20">
            <custom-table-component
                    class="summary-result-table"
                    tableClass="tw-w-full"
                    :data-list="summaryData"
                    :headers="selectedColumns"
                    no-data-text="No components for this group"
                    > 
                <template v-slot:tableHeaders >
                    <td></td>
                    <td v-for="(value, index) in summaryColumns" :key="value.id">
                        <div class="tw-flex">
                            <p v-if="value.checked == true" 
                            :class="'tw-w-1/' + selectedColumns.length + ' tw-text-center tw-pt-5 tw-pb-5 tw-pl-12 tw-pr-2'">{{ value.title }}</p>
                            <button
                            v-on:click="toggleOrderBy(index)"
                            class="tw-bg-transparent tw-z-20 tw-mb-2 tw-mr-2"
                            :aria-expanded="value.isDesc"
                            :aria-controls="`collapse${_uid}`"
                            >
                                <svg
                                v-if="value.orderByCount <= 1 && value.checked == true"
                                class="tw-w-3 tw-h-5 tw-transition-all tw-duration-200 tw-transform"
                                :class="{
                                'tw-rotate-180': !value.isDesc,
                                'tw-rotate-0': value.isDesc,
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
                            </button>

                            <button
                            v-on:click="toggleOrderBy(index)"
                            class="tw-bg-transparent tw-z-20  tw-mb-2 tw-mr-4"
                            :aria-expanded="value.isDesc"
                            :aria-controls="`collapse${_uid}`"
                            >
                                <svg
                                v-if="value.orderByCount == 2 && value.checked == true"
                                class="tw-w-3 tw-h-5 tw-mb-2 tw-transition-all tw-duration-200 tw-transform"
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
                            </button>

                        </div>
                    </td>
                </template>
            
            <template v-slot:slotData="{ dataList }">
                <custom-table-row
                v-for="(result, rowIndex) in dataList"
                :key="rowIndex"
                :result="result"
                :row-index="rowIndex">
                <template v-slot:default="{ result }">
                    <td class="tw-flex">
                        <p class="tw-ra tw-ml-2 tw-mt-4">
                            <a :href="'/dc/visit/' + result.PROP + '-' + result.VISIT_NUMBER
                            + '/id/' + result.DATACOLLECTIONID" class="tw-button tw-button-notext tw-dll" title="Go to Data Collection">
                            <i class="fa fa-search"></i></a>
                        </p>
                        <p class="tw-ra tw-ml-2 tw-mt-4">
                            <a href="'+app.apiurl+'/download/id/<%-DCID%>/aid/<%-AID%>" class="tw-button tw-button-notext tw-dll" 
                                title="Download MTZ file"><i class="fa fa-download"></i></a>
                        </p>
                    </td>
                    <td v-for="(value) in summaryColumns" :key="value.id">
                        <p v-if="value.checked == true && value.expandable == false && value.isbutton == false" class="tw-p-2 tw-text-center">{{ result[value.key] }}</p>
                        <p v-if="value.checked == true && value.expandable == false && value.isbutton == true" class="tw-p-2 tw-text-center">
                            <button v-on:click="toggleExpandAutoProc(rowIndex)"
                                    class="tw-z-60 tw-rounded-full tw-h-6 tw-max-w-xs tw-ml-1 tw-pt-1 
                                    tw-pr-1 tw-pl-1 tw-bg-content-active">{{ result[value.key] }}</button>
                        </p>
                        <div :ref="'autoproc-' + rowIndex" v-if="expandProcessing == false && value.checked == true && value.expandable == true " class="tw-p-2" >
                            <div class="childNode tw-text-center" v-for="splitProc in getProcRow(value.key, result)" :key="splitProc.id">
                                {{ splitProc }}
                            </div>    
                        </div>
                    </td>
                </template>
                </custom-table-row>

            </template>
            
            <template v-slot:noData>
                <custom-table-row class="tw-w-full tw-bg-table-body-background-odd">
                <td :colspan='summaryColumns.length' class="tw-text-center tw-py-2 tw-ml-4 tw-mr-4">No results found</td>
                </custom-table-row>

            </template>


            </custom-table-component>
        </div>

        <pagination-panel
        :initial-page="1"
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

import Pagination from 'app/components/pagination.vue'

import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'
import ComboBox from 'app/components/combo-box.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from '../../../app/components/base-input-text.vue'

import ExpandableSidebar from '../../../app/components/expandable-sidebar.vue'
import CustomAccordian from '../../../app/components/custom-accordian.vue'

import { chunk } from 'lodash';



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
            isLoading : false,
            isHidden: true,
            totalRecords:  10,
            pageSize: 15,
            currentPage: 1,
            summaryCollection : null,
            summaryData : [],
            summaryExport : [],
            proposalCollection : null,
            proposals : [],
            deselectedColumns: [],
            selectedColumns: [],
            expandProcessing : false,
            summaryColumns: [
                {
                    key: "DATACOLLECTIONID",
                    title: 'Data Collection Id',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descdcid',
                    ascParam : 'ascdcid',
                    isbutton: false,
                    expandable: false,
                },
                {
                    key: "FILETEMPLATE",
                    title: 'Prefix',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descpref',
                    ascParam : 'ascpref',
                    isbutton: false,
                    expandable: false,
                },
                {
                    key: "_NAME",
                    title: 'Sample Name',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descsmpl',
                    ascParam : 'ascsmpl',
                    isbutton: false,
                    expandable: false,
                },
                {
                    key: "STARTTIME",
                    title: 'Start Time',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descstdt',
                    ascParam : 'ascstdt',
                    isbutton: false,
                    expandable: false,
                },
                {
                    key: "PROCESSINGPROGRAMS",
                    title: 'Processing Programs',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    // needing changed
                    descParam : 'descpp',
                    ascParam : 'ascpp',
                    isbutton: true,
                    expandable: false,
                },
                {
                    key: "SPACEGROUP",
                    title: 'Space Group',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descsg',
                    ascParam : 'ascsg',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "REFINEDCELL_A",
                    title: 'Unit Cell A',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrca',
                    ascParam : 'ascrca',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "REFINEDCELL_B",
                    title: 'Unit Cell B',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrcb',
                    ascParam : 'ascrcb',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "REFINEDCELL_C",
                    title: 'Unit Cell C',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrcc',
                    ascParam : 'ascrcc',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "REFINEDCELL_ALPHA",
                    title: 'Unit Cell Alpha',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrca',
                    ascParam : 'ascrca',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "REFINEDCELL_BETA",
                    title: 'Unit Cell Beta',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrcb',
                    ascParam : 'ascrcb',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "REFINEDCELL_GAMMA",
                    title: 'Unit Cell Gamma',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrcc',
                    ascParam : 'ascrcc',
                    isbutton: false,
                    expandable: true,
                },
                // ----------------------------------------------------
                {
                    key: "RMEASWITHINIPLUSIMINUS_INNER",
                    title: 'RMeas (Inner)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrmeasin',
                    ascParam : 'ascrmeasin',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RMEASWITHINIPLUSIMINUS_OUTER",
                    title: 'RMeas (Outer)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrmeasou',
                    ascParam : 'ascrmeasou',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RMEASWITHINIPLUSIMINUS_OVERALL",
                    title: 'RMeas (Overall)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrmeasov',
                    ascParam : 'ascrmeasov',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RESOLUTIONLIMITHIGH_INNER",
                    title: 'Resolution Limit High (Inner)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrlhin',
                    ascParam : 'ascrlhin',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RESOLUTIONLIMITHIGH_OUTER",
                    title: 'Resolution Limit High (Outer)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrlhou',
                    ascParam : 'ascrlhou',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RESOLUTIONLIMITHIGH_OVERALL",
                    title: 'Resolution Limit High (Overall)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrlhov',
                    ascParam : 'ascrlhov',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "CCANOMALOUS_INNER",
                    title: 'CC Anomalous (Inner)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descccain',
                    ascParam : 'ascccain',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "CCANOMALOUS_OUTER",
                    title: 'CC Anomalous (Outer)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descccaou',
                    ascParam : 'ascccaou',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "CCANOMALOUS_OVERALL",
                    title: 'CC Anomalous (Overall)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descccaov',
                    ascParam : 'ascccaov',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RFREEVALUESTART_INNER",
                    title: 'R Free Initial (Inner)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrfsin',
                    ascParam : 'ascrfsin',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RFREEVALUESTART_OUTER",
                    title: 'R Free Initial (Outer)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrfsou',
                    ascParam : 'ascrfsou',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RFREEVALUESTART_OVERALL",
                    title: 'R Free Initial (Overall)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrfsov',
                    ascParam : 'ascrfsov',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RFREEVALUEEND_INNER",
                    title: 'R Free Final  (Inner)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrfein',
                    ascParam : 'ascrfein',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RFREEVALUEEND_OUTER",
                    title: 'R Free Final (Outer)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrfeou',
                    ascParam : 'ascrfeou',
                    isbutton: false,
                    expandable: true,
                },
                {
                    key: "RFREEVALUEEND_OVERALL",
                    title: 'R Free Final (Overall)',
                    checked: true,
                    isDesc : false,
                    orderByCount: 2,
                    descParam : 'descrfeov',
                    ascParam : 'ascrfeov',
                    isbutton: false,
                    expandable: true,
                },
            ],
            filterOptions: {
                SPACEGROUP : {
                    title: 'Space Group',
                    inputtype: 'combo-box',
                    selectedValue: '',
                    textField: "SPACEGROUPNAME",
                    valueField: "SPACEGROUPNAME",
                    data: []
                },
                RESLIMITHIGH_OUTER : {
                    title: 'Resolution Limit High (Outer)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RMEASWIPLUSIMINUS_OUTER : {
                    title: 'Rmeas (Outer)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                CCANOM_OUTER : {
                    title: 'CC Anomalous (Outer)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RFREEINITIAL_OUTER : {
                    title: 'RFree Initial (Outer)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RFREEFINAL_OUTER : {
                    title: 'RFree Final (Outer)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                // ----------------------------
                RESLIMITHIGH_INNER : {
                    title: 'Resolution Limit High (Inner)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RMEASWIPLUSIMINUS_INNER : {
                    title: 'Rmeas (Inner)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                CCANOM_INNER : {
                    title: 'CC Anomalous (Inner)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RFREEINITIAL_INNER : {
                    title: 'RFree Initial (Inner)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RFREEFINAL_INNER : {
                    title: 'RFree Final (Inner)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                // ----------------------------
                RESLIMITHIGH_OVERALL : {
                    title: 'Resolution Limit High (Overall)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RMEASWIPLUSIMINUS_OVERALL : {
                    title: 'Rmeas (Overall)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                CCANOM_OVERALL : {
                    title: 'CC Anomalous (Overall)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RFREEINITIAL_OVERALL : {
                    title: 'RFree Initial (Overall)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
                RFREEFINAL_OVERALL : {
                    title: 'RFree Final (Overall)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: '',
                },
            },
            inputChanged : '',
            selectedProposal : '',
            searchedGtUnitCellA : '',
            searchedLtUnitCellA : '',
            searchedGtUnitCellB : '',
            searchedLtUnitCellB : '',
            searchedGtUnitCellC : '',
            searchedLtUnitCellC : '',
            tempPrefix : '',
            searchedPrefix : '',
        }
    },
    created() {
        this.searchProposal()
        this.getSpaceGroupsCollection()
        this.populateSelectedColumns()

    },
    mounted() {
            // window.onresize = () => {
            //     this.windowWidth = window.innerWidth
            // }
    },
    methods: {
        async toggleOrderBy(column) {

            this.isLoading = true;

            this.summaryColumns[column].isDesc = !this.summaryColumns[column].isDesc;
            this.summaryColumns[column].orderByCount += 1;

            console.log(this.summaryColumns)

            if (this.summaryColumns[column].orderByCount > 2) {
                this.summaryColumns[column].orderByCount = 0;
                this.summaryColumns[column].isDesc = false;
                };
            
            this.getQueryParams(false);

            const results = await this.$store.dispatch('getCollection', this.summaryCollection);

            this.summaryData = results.toJSON();

            this.isLoading = false;

        },
        async searchProposal() {

            this.isLoading = true;

            this.proposalCollection = new ProposalCollection();
            this.proposalCollection.queryParams.s = this.proposalText;
            this.proposalCollection.state.pageSize = 999;

            const results = await this.$store.dispatch('getCollection', this.proposalCollection);
            this.proposals = results.toJSON();

            this.isLoading = false;
        },
        async getSpaceGroupsCollection() {

            this.isLoading = true;

            this.spaceGroupsCollection = new SpaceGroups(null, { state: { pageSize: 9999 } })
            if (!this.SPACEGROUP) {
                this.spaceGroupsCollection.queryParams.ty = this.containerGroup
            }

            const result = await this.$store.dispatch('getCollection', this.spaceGroupsCollection)
            this.filterOptions.SPACEGROUP.data = result.toJSON()

            this.isLoading = false;

        },
        async searchFilterParams() {

            this.isLoading = true;

            this.getQueryParams(false);

            const results = await this.$store.dispatch('getCollection', this.summaryCollection);

            this.totalRecords = results.state.totalRecords;
            this.summaryData = results.toJSON();

            console.log('summarydata', this.summaryData)

            this.isLoading = false;

        },
        async handlePageChange(data) {

            this.isLoading = true;

            this.currentPage = data.currentPage;
            this.pageSize = data.pageSize;
            if (this.selectedProposal){

                this.getQueryParams(false);

                const results = await this.$store.dispatch('getCollection', this.summaryCollection);
                this.summaryData = results.toJSON();

            };


            this.isLoading = false;

        },
        async downloadFile() {
            console.log('download')

            if (this.summaryData) {
                this.getQueryParams(true);

                const results = await this.$store.dispatch('getCollection', this.summaryCollection);
                this.summaryExport = results.toJSON();

                const csv = this.convertToCSV(this.summaryExport);
                this.exportCSV(csv);

                this.summaryExport = [];
            }
        },
        getQueryParams(isexport) {

            console.log('getqueryparams')
            this.summaryCollection = new SummaryCollection()

            if (isexport == true) {
                console.log('query params true!!');
                console.log(this.totalRecords);
                this.summaryCollection.queryParams = { page: this.currentPage, per_page: this.totalRecords };
            }
            else {
                this.summaryCollection.queryParams = { page: this.currentPage, per_page: this.pageSize };
            }

            for (var index in this.summaryColumns) {
                if ( this.summaryColumns[index].orderByCount < 2 && this.summaryColumns[index].isDesc == true) {
                    var desc = this.summaryColumns[index].descParam;
                    this.summaryCollection.queryParams[desc] = 'desc';
                }
                else if ( this.summaryColumns[index].orderByCount < 2 && this.summaryColumns[index].isDesc == false) {
                    var asc = this.summaryColumns[index].ascParam;
                    this.summaryCollection.queryParams[asc] = 'asc';
                }

            }
            

            // if (this.searchedPrefix) {
            //     this.summaryCollection.queryParams.sprefix = this.searchedPrefix;
            // }
            if (this.selectedProposal) {
                this.summaryCollection.queryParams.prop = this.selectedProposal;
            }
            // if (this.searchedGtUnitCellA) {
            //     this.summaryCollection.queryParams.gca = this.searchedGtUnitCellA;
            // }
            // if (this.searchedLtUnitCellA) {
            //     this.summaryCollection.queryParams.lca = this.searchedLtUnitCellA;
            // }
            // if (this.searchedGtUnitCellB) {
            //     this.summaryCollection.queryParams.gcb = this.searchedGtUnitCellB;
            // }
            // if (this.searchedLtUnitCellB) {
            //     this.summaryCollection.queryParams.lcb = this.searchedLtUnitCellB;
            // }
            // if (this.searchedGtUnitCellC) {
            //     this.summaryCollection.queryParams.gc = this.searchedGtUnitCellC;
            // }
            // if (this.searchedLtUnitCellC) {
            //     this.summaryCollection.queryParams.lc = this.searchedLtUnitCellC;
            // }
            // if (this.filterOptions.SPACEGROUP.selectedValue) {
            //     this.summaryCollection.queryParams.sg = this.filterOptions.SPACEGROUP.selectedValue;
            // }
            // if (this.filterOptions.RESLIMITHIGH.filteredGt) {
            //     this.summaryCollection.queryParams.grlh = this.filterOptions.RESLIMITHIGH.filteredGt;
            // }

            // if (this.filterOptions.RESLIMITHIGH.filteredLt) {
            //     this.summaryCollection.queryParams.lrlh = this.filterOptions.RESLIMITHIGH.filteredLt;
            // }
            // if (this.filterOptions.RMEASWIPLUSIMINUS.filteredGt) {
            //     this.summaryCollection.queryParams.grm = this.filterOptions.RMEASWIPLUSIMINUS.filteredGt;
            // }
            // if (this.filterOptions.RMEASWIPLUSIMINUS.filteredLt) {
            //     this.summaryCollection.queryParams.lrm = this.filterOptions.RMEASWIPLUSIMINUS.filteredLt;
            // }
            // if (this.filterOptions.CCANOM.filteredGt) {
            //     this.summaryCollection.queryParams.gcc = this.filterOptions.CCANOM.filteredGt;
            // }
            // if (this.filterOptions.CCANOM.filteredLt) {
            //     this.summaryCollection.queryParams.lcc = this.filterOptions.CCANOM.filteredLt;
            // }
            // if (this.filterOptions.RFREEFINAL.filteredGt) {  
            //     this.summaryCollection.queryParams.grff = this.filterOptions.RFREEFINAL.filteredGt;
            // }  
            // if (this.filterOptions.RFREEFINAL.filteredLt) {
            //     this.summaryCollection.queryParams.lrff = this.filterOptions.RFREEFINAL.filteredLt;
            // }
            // if (this.filterOptions.RFREEINITIAL.filteredGt) {
            //     this.summaryCollection.queryParams.grfi = this.filterOptions.RFREEINITIAL.filteredGt;
            // }
            // if (this.filterOptions.RFREEINITIAL.filteredLt) {
            //     this.summaryCollection.queryParams.lrfi = this.filterOptions.RFREEINITIAL.filteredLt;
            // }

 
        },
        clearQueryParams() {

            this.searchedPrefix = '';
            this.selectedProposal = '';
            this.selectedSpaceGroup = '';
            this.searchedGtUnitCellA = '';
            this.searchedLtUnitCellA = '';
            this.searchedGtUnitCellB = '';
            this.searchedLtUnitCellB = '';
            this.searchedGtUnitCellC = '';
            this.searchedLtUnitCellC = '';
            this.filterOptions.RESLIMITHIGH.filteredGt = '';
            this.filterOptions.RESLIMITHIGH.filteredLt = '';
            this.filterOptions.RMEASWIPLUSIMINUS.filteredGt = '';
            this.filterOptions.RMEASWIPLUSIMINUS.filteredLt = '';
            this.filterOptions.CCANOM.filteredGt = '';
            this.filterOptions.CCANOM.filteredLt = '';
            this.filterOptions.RFREEFINAL.filteredGt = '';
            this.filterOptions.RFREEFINAL.filteredLt = '';
            this.filterOptions.RFREEINITIAL.filteredGt = '';
            this.filterOptions.RFREEINITIAL.filteredLt = '';

            
        },
        toggleExpandAutoProc(index) {
            // this.expandProcessing = !this.expandProcessing;
            if($(this.$refs['autoproc-' + index]).is(":hidden")) {
                $(this.$refs['autoproc-' + index]).show();
            }
            else {
                $(this.$refs['autoproc-' + index]).hide();
            }
        },
        onPrefixSearch() {
            this.searchedPrefix = this.tempPrefix;
            this.searchFilterParams();
        },  
        populateSelectedColumns() {
            for (const value of Object.entries(this.summaryColumns)) {
                this.selectedColumns.push(value[1].title);
            };
        },
        checkedColumns(index) {
            this.summaryColumns[index].checked = !this.summaryColumns[index].checked;
            if (this.summaryColumns[index].checked == false){

                this.deselectedColumns.push(this.summaryColumns[index].title);
                this.selectedColumns = this.selectedColumns.filter(item => item !== this.summaryColumns[index].title);
            }
            else {
                this.selectedColumns.push(this.summaryColumns[index].title);
                this.deselectedColumns = this.deselectedColumns.filter(item => item !== this.summaryColumns[index].title);

            }
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
        getProcRow(value, result) {
            if (result[value]) {
                var dataArray = result[value].split(",");
                return dataArray;
            }
            else {
                return [];
            }
        },
        addSGCombo(value) {
            console.log('hello space group!', value)
            this.filterOptions.SPACEGROUP.selectedValue = value;
        }


    },
    computed:{
        groupedOptions() {
            const chunksize = 5;

            const obj = this.filterOptions
            
            const output = Object.keys(obj).reduce((c, k, i) => {
            if (i % chunksize == 0) {
                c.push(Object.fromEntries([[k, obj[k]]]));
            } else {
                c[c.length - 1][k] = obj[k];
            }
            return c;
            }, []);

            console.log(output)

            return output;
        }

    },

    
}

</script>


<style scoped>

    .hide {
    position: absolute !important;
    top: -9999px !important;
    left: -9999px !important;
    }
    .status {
    height: 100px;
    width: 50px;
    margin-left: 550px;
    
    }
</style>