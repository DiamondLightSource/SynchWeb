<template>
    <div>

        <div class="tw-mt-12 tw-mb-4">
            
        </div>

        <expandable-sidebar >
            <template v-slot:sidebar-content>

                <custom-accordian class="tw-pt-6 tw-pb-6"> 
                    <template v-slot:title>
                    <span class="tw-font-semibold tw-text-base">Proposal</span>
                    </template>

                    <template v-slot:content>
                        <div class="tw-pt-3 tw-pb-2">
                            <p>Enter your proposal here...</p>
                        <combo-box
                        class="tw-w-10/12 tw-max-w-sm proposal-select"
                        :data="proposals"
                        textField="PROP"
                        valueField="PROPOSALID"
                        size="small"
                        :canCreateNewItem=false
                        v-model="selectedProposal"
                        ></combo-box>
                        </div>
                    </template>
                </custom-accordian>

                <custom-accordian class="tw-pt-6 tw-pb-6">
                    <template v-slot:title>
                    <span class="tw-font-semibold tw-text-base">Space Group</span>
                    </template>
                    <template v-slot:content>
                        <div class="tw-pt-3 tw-pb-2">
                            <p>Search space group here...</p>
                        </div>
                    </template>
                </custom-accordian>

                <custom-accordian class="tw-pt-6 tw-pb-6">
                    <template v-slot:title>
                    <span class="tw-font-semibold tw-text-base">Unit Cell</span>
                    </template>
                    <template v-slot:content>
                        <p>
                        </p>
                    </template>
                </custom-accordian>


            </template>
        </expandable-sidebar>
    
    
            <custom-table-component
            class="tw-w-full summary-result-table"
            :data-list="summaryData"
            :headers="headers"
            no-data-text="No components for this group"
            > 
                <template v-slot:tableHeaders>
                <td class="tw-w-1/12 tw-py-2 tw-text-center">Processing Programs</td>
                <td class="tw-w-1/12 tw-py-2 tw-text-center">Space Group</td>
                <td class="tw-w-1/12 tw-py-2 tw-text-center">Unit Cell A</td>
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
                    <td class="tw-w-5/12 tw-text-center">
                        <p>{{ result['PROCESSINGPROGRAMS'] }}</p>
                    </td>
                    <td class="tw-w-2/12 tw-text-center">
                        <p>{{ result['SPACEGROUP'] }}</p>
                    </td>
                    <td class="tw-w-2/12 tw-text-center">
                        <p>{{ result['REFINEDCELL_A'] }}</p>
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
            summaryCollection : null,
            summaryData : [],
            proposalCollection : null,
            proposals : [],
            selectedProposal : '',
            filterParams : [
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},
                { key: '', value: ''},

            ],
            headers: [
            { key: 'PROCESSINGPROGRAMS', title: 'Processing Programs'},
            { key: 'SPACEGROUP', title: 'Space Group'},
            { key: 'REFINEDCELL_A', title: 'Unit Cell A'},
            ],
            summaryResults: [
                {PROCESSINGPROGRAMS: 1, SPACEGROUP: 1, REFINEDCELL_A: 1}, 
            ],
            comboOptionsList : [
                {VALUE: 'this', TEXT: 'that'},
                {VALUE: 'another', TEXT: 'thing'},

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
            this.proposalCollection.state.pageSize = 9999
            const results = await this.$store.dispatch('getCollection', this.proposalCollection)
            this.proposals = results.toJSON()
            
        },
        async fetchSummaryInformation() {
            this.summaryCollection = new SummaryCollection()
            this.summaryCollection.queryParams.PROPOSALID = this.selectedProposal
            const results = await this.$store.dispatch('getCollection', this.summaryCollection)
            this.summaryData = results.toJSON()
            console.log('SUMMARY DATA')
            console.log(this.summaryData)
        },
        async fetchFilterParams() {

        }

        }
    },
    watch: {
        selectedProposal(newValue) {
            if(newValue) {
                this.fetchSummaryInformation()
            }
        }
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