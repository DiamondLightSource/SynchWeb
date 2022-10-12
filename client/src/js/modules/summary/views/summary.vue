<template>
    <div>

        <div class="tw-mt-12 tw-mb-4">
            
        </div>

        <expandable-sidebar >
            <template v-slot:sidebar-title> 
                <div>
                    <h>Filter </h>
                    <button @click="searchFilterParams" class="tw-flex-shrink-0 tw-bg-content-active hover:tw-bg-teal-700 tw-border-content-active hover:tw-border-teal-700 tw-text-sm tw-border-4 tw-text-black tw-py-1 tw-px-1 tw-rounded" type="button"
                    >
                    Search
                    </button>
                </div>
            </template>
            <template v-slot:sidebar-content>

                <custom-accordian class="tw-pt-6 tw-pb-6"> 
                    <template v-slot:title>
                    <span class="tw-font-semibold tw-text-base">Proposal</span>
                    </template>

                    <template v-slot:content>
                        <div class="tw-grid tw-grid-cols-2 tw-divide-x tw-divide-gray-400 tw-pt-3 tw-pb-2">
                        <combo-box
                        class="tw-w-10/12 tw-max-w-sm proposal-select"
                        :data="proposals"
                        textField="PROP"
                        valueField="PROPOSALID"
                        size="small"
                        :canCreateNewItem=false
                        v-model="selectedProposal"
                        defaultText=""
                        ></combo-box>
                        <p class="tw-italic">Search for your <br>Proposal Number</p>
                        </div>
                    </template>
                </custom-accordian>

                <custom-accordian class="tw-pt-6 tw-pb-6">
                    <template v-slot:title>
                    <span class="tw-font-semibold tw-text-base">Processing Programs</span>
                    </template>
                    <template v-slot:content>
                        <div class="tw-grid tw-grid-cols-2 tw-divide-x tw-divide-gray-400 tw-pt-3 tw-pb-2">
                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                            placeholder="Type here"
                            v-model="searchedProcPrograms">
                            <p class="tw-italic">Search for <br>Processing Programs</p>
                        </div>
                    </template>
                </custom-accordian>

                <custom-accordian class="tw-pt-6 tw-pb-6">
                    <template v-slot:title>
                    <span class="tw-font-semibold tw-text-base">Unit Cell</span>
                    </template>
                    <template v-slot:content>
                        <div class="tw-grid tw-grid-cols-2 tw-divide-x tw-divide-gray-400 tw-pt-3 tw-pb-2">
                            <div class="tw-space-y-1">
                                <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                                placeholder="Greater than"
                                v-model="searchedGtUnitCellA">
                                <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                                placeholder="Less than"
                                v-model="searchedLtUnitCellA">
                            </div>
                            <p class="tw-italic">Filter for <br>Unit Cell A</p>
                        </div>

                        <div class="tw-grid tw-grid-cols-2 tw-divide-x tw-divide-gray-400 tw-pt-3 tw-pb-2">
                            <div class="tw-space-y-1">
                                <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                                placeholder="Greater than"
                                v-model="searchedGtUnitCellA">
                                <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                                placeholder="Less than"
                                v-model="searchedLtUnitCellA">
                            </div>
                            <p class="tw-italic">Filter for <br>Unit Cell B</p>
                        </div>

                        <div class="tw-grid tw-grid-cols-2 tw-divide-x tw-divide-gray-400 tw-pt-3 tw-pb-2">
                            <div class="tw-space-y-1">
                                <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                                placeholder="Greater than"
                                v-model="searchedGtUnitCellA">
                                <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                                placeholder="Less than"
                                v-model="searchedLtUnitCellA">
                            </div>
                            <p class="tw-italic">Filter for <br>Unit Cell C</p>
                        </div>

                        
                    </template>
                </custom-accordian>

                <ul>
                    <custom-accordian class="tw-pt-6 tw-pb-6" v-for="value in filterOptions" :key="value.id">
                    <template v-slot:title>
                        <span class="tw-font-semibold tw-text-base">{{ value.title }}</span>
                    </template>
                    <template v-slot:content>

                        <div v-if="value.inputtype == 'greater-than-less-than'" class="tw-grid tw-grid-cols-2 tw-divide-x tw-divide-gray-400 tw-pt-3 tw-pb-2">
                            <div class="tw-space-y-1">
                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                            placeholder="Greater than"
                            v-model="value.filteredGt">
                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                            placeholder="Less than"
                            v-model="value.filteredLt">
                            </div>
                            <p class="tw-italic">Search for <br>{{ value.title }}</p>
                        </div>

                        <div v-if="value.inputtype == 'search-for-value'" class="tw-grid tw-grid-cols-2 tw-divide-x tw-divide-gray-400 tw-pt-3 tw-pb-2">
                            <input class="tw-w-10/12 tw-block tw-appearance-none tw-text-gray-700 tw-bg-white tw-border hover:tw-border-gray-500 tw-px-4 tw-rounded tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                            placeholder="Type here"
                            v-model="value.searchedValue">
                            <p class="tw-italic">Search for <br> {{value.title}} </p>
                        </div>
                        
                    </template>
                    </custom-accordian>
                    <li v-for="value in filterOptions" :key="value.id">
                            {{ value }}
                    </li>
                </ul>

            </template>
        </expandable-sidebar>

        <div class="tw-grid tw-grid-cols-2 gap-8">
            <div>
                <form class="tw-mt-10 tw-items-center">   
                    <label for="simple-search" class="sr-only">Search</label>
                    <div class="tw-relative tw-w-full">
                        <!-- <input type="text" id="simple-search" class="tw-bg-gray-50 tw-border tw-border-gray-300 
                        tw-text-gray-900 tw-text-sm tw-rounded-lg focus:tw-ring-blue-500 focus:tw-border-blue-500 
                        tw-block tw-w-full tw-pl-10 tw-p-2.5  " placeholder="Search" required> -->
                        <input type="text" id="simple-search" class="tw-block tw-pl-10 tw-p-2.5 tw-appearance-none tw-text-gray-700 tw-bg-white tw-border 
                        hover:tw-border-gray-500 tw-px-4 tw-rounded-lg tw-shadow tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                        placeholder="Search" required>
                        <div class="tw-flex tw-absolute tw-inset-y-0 tw-left-0 tw-items-center tw-pl-3 tw-pointer-events-none">
                            <svg aria-hidden="true" class="tw-w-5 tw-h-5 tw-text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                        </div>
                    </div>
                </form>
            </div>

            <div>
                <p class="tw-text-content-sub-header-background tw-ml-2">Select Columns</p>
                <div class="tw-py-2 tw-px-6 tw-border tw-rounded-lg tw-border-content-sub-header-background">
                    <div class="tw-relative tw-w-full">

                        <button v-on:click="isHidden = !isHidden" id="dropdownInformationButton" data-dropdown-toggle="dropdown" 
                        class="tw-h-8 tw-text-black tw-rounded tw-text-xs tw-px-4 tw-text-center tw-inline-flex tw-items-center 
                        tw-bg-content-sub-header-background tw-border-content-sub-header-background tw-border-4 
                        tw-text-black tw-py-1 tw-px-5" type="button">Columns </button>

                        <div id="dropdown" class="tw-absolute 
                        tw-z-10 tw-w-44 tw-bg-white tw-rounded tw-divide-y tw-divide-gray-100 tw-shadow
                        tw-transition tw-ease-out tw-duration-100"
                        :class="isHidden ? 'tw-transform tw-opacity-0 tw-scale-95' : 'tw-transform tw-opacity-100 tw-scale-100'">
                        
                            <ul class="tw-py-1 tw-text-sm tw=text-gray-700" aria-labelledby="dropdownInformationButton">
                            <li> 
                                <div v-for="(value, index) in summaryColumns" :key="value.id" class="tw-flex tw-items-center tw-ml-2">
                                    <input checked
                                    @click="checkedColumns(index)"
                                    id="default-checkbox" type="checkbox" value="" 
                                    class="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-rounded 
                                    tw-border-gray-300 focus:tw-ring-blue-500 focus:tw-ring-2">
                                    <a href="#" class="tw-block tw-text-xs tw-py-2 tw-px-4 hover:tw-bg-gray-100"> {{ value.title }} </a>
                                    {{ value }}
                                </div>
                            </li>
                            </ul>

                        </div>

                        <div class="tw-absolute tw-right-0 tw-top-0"> 
                            <ul   
                                 class="tw-flex">
                                <p v-for="value in summaryColumns" :key="value.id"
                                class="tw-rounded-full tw-h-6 tw-max-w-xs tw-ml-1 tw-pt-1 
                                tw-pr-1 tw-pl-1 tw-bg-content-active "> {{ value.title }} </p>

                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <custom-table-component
                class="tw-w-full summary-result-table"
                :data-list="summaryData"
                :headers="selectedColumns"
                no-data-text="No components for this group"
                > 
            <template v-slot:tableHeaders>
                <td v-for="value in summaryColumns" :key="value.id" class="tw-w-1/12 tw-py-2 tw-text-center">
                            {{ value.title }}
                </td>
            <td class="tw-w-1/12 tw-py-2"></td>
            </template>

        <template v-slot:slotData="{ dataList }">
            <custom-table-row
            class="tw-w-full"
            v-for="(result, rowIndex) in dataList"
            :key="rowIndex"
            :result="result"
            :row-index="rowIndex">
            <template v-slot:default="{ result }">
                <td v-for="value in selectedColumns" :key="value.id" :class="value.class">
                    <p>{{ result[value.key] }}</p>
                </td>
            </template>
            </custom-table-row>

        </template>

        <template v-slot:noData>
            <custom-table-row class="tw-w-full tw-bg-table-body-background-odd">
            <td colspan="5" class="tw-text-center tw-py-2">No results found</td>
            </custom-table-row>
        </template>

        </custom-table-component>


    </div>
</template>


<script>

import SummaryCollection from 'modules/summary/collections/summaryresults.js'
import ProposalCollection from 'collections/proposals'

import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'
import ComboBox from 'app/components/combo-box.vue'
import BaseInputText from '../../../app/components/base-input-text.vue'

import ExpandableSidebar from '../../../app/components/expandable-sidebar.vue'
import CustomAccordian from '../../../app/components/custom-accordian.vue'



export default {
    name: 'Summary',
    components: {
    'custom-table-component': CustomTableComponent,
    'custom-table-row':CustomTableRow,
    'combo-box': ComboBox,
    'expandable-sidebar': ExpandableSidebar,
    'custom-accordian': CustomAccordian,
    'base-input-text' : BaseInputText
    },
    data() {
        
        return {
            isHidden: true,
            summaryCollection : null,
            summaryData : [],
            proposalCollection : null,
            proposals : [],
            selectedProposal : '',
            searchedProcPrograms : '',
            deselectedColumns: [],
            selectedColumns: [],
            summaryColumns: [
                {
                    key: 'PROCESSINGPROGRAMS',
                    title: 'Processing Programs',
                    class: 'tw-w-4/12 tw-text-center',
                    checked: true
                },
                {
                    key: 'SPACEGROUP',
                    title: 'Space Group',
                    class: 'tw-w-2/12 tw-text-center',
                    checked: true
                },
                {
                    key: 'REFINEDCELL_A',
                    title: 'Unit Cell A',
                    class: 'tw-w-2/12 tw-text-center',
                    checked: true
                },
            ],
            filterOptions: [
                {
                    key: 'SPACEGROUP',
                    title: 'Space Group',
                    inputtype: 'search-for-value',
                    searchedValue: ''
                },
                {
                    key: 'RESLIMITHIGH',
                    title: 'Resolution Limit (High)',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: ''
                },
                {
                    key: 'RMEASWIPLUSIMINUS',
                    title: 'Rmeas',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: ''
                },
                {
                    key: 'CCANOM',
                    title: 'CC Anomalous',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: ''
                },
                {
                    key: 'RFREEINITIAL',
                    title: 'RFree Initial',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: ''
                },
                {
                    key: 'RFREEFINAL',
                    title: 'RFree Final',
                    inputtype: 'greater-than-less-than',
                    filteredLt: '',
                    filteredGt: ''
                },

            ]
 
        }
    },
    created() {
        this.searchProposal()

    },
    computed: {
        proposalSelectList() {
        }
    },
    methods: {
        async searchProposal() {
            this.proposalCollection = new ProposalCollection()
            this.proposalCollection.queryParams.s = this.proposalText
            this.proposalCollection.state.pageSize = 1000
            const results = await this.$store.dispatch('getCollection', this.proposalCollection)
            this.proposals = results.toJSON()
            
        },
        // async fetchSummaryInformation() {
        //     this.summaryCollection = new SummaryCollection()
        //     this.summaryCollection.queryParams.PROPOSALID = this.selectedProposal
        //     const results = await this.$store.dispatch('getCollection', this.summaryCollection)
        //     this.summaryData = results.toJSON()
        //     console.log('SUMMARY DATA')
        //     console.log(this.summaryData)
        // },
        async searchFilterParams() {
            this.summaryCollection = new SummaryCollection()
            this.summaryCollection.queryParams.PROPOSALID = this.selectedProposal
            this.summaryCollection.queryParams.sg = this.searchedSpaceGroup
            const results = await this.$store.dispatch('getCollection', this.summaryCollection)
            this.summaryData = results.toJSON()
            console.log('SUMMARY DATA')
            console.log(this.selectedProposal, this.searchedSpaceGroup)
            console.log(this.summaryData)
        },
        checkedColumns(index) {
            this.summaryColumns[index].checked = !this.summaryColumns[index].checked
            if (this.summaryColumns[index].checked == true){
                console.log('checked!!!')
            }
        },
    },
    watch: {
        // selectedProposal(newValue) {
        //     if(newValue) {
        //         this.fetchSummaryInformation()
        //     }
        // }
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


            <!-- <td class="tw-w-1/12 tw-py-2 tw-text-center">Unit Cell B</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">Unit Cell C</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">Unit Cell Alpha</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">Unit Cell Beta</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">Unit Cell Gamma</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">Resolution Limit (H)</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">Rmeas</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">CC Anomalous</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">R Free Initial</td>
            <td class="tw-w-1/12 tw-py-2 tw-text-center">R Free Final</td> -->