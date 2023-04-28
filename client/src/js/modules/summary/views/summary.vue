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

                    <div class="tw-grid tw-grid-cols-4 tw-gap-2 tw-pb-2">

                    <custom-accordian class="tw-pt-6 tw-pb-8"> 
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

                            <custom-accordian class="tw-pt-6 tw-pb-8" v-for="value in options" :key="value.id">
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
                                    v-on:create-new-option="(...args)=>addToCombo([value.key,...args])"
                                    v-model="value.selectedValue"
                                    :defaultText="value.selectedValue"
                                    ></combo-box>
                                    <p class="tw-italic tw-ml-2">Search for <br>{{ value.title }}</p>
                                </div>
                                
                            </template>
                            </custom-accordian>

                        </div>

                    </div>

                    <div class="tw-pb-2 tw-pt-2">

                        <custom-accordian class="tw-pt-6 tw-pb-8 tw-w-8/12">
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


                    <div class="tw-grid tw-grid-cols-12 tw-pb-2 tw-p-3" tabindex="0"  @focusout="updateParamsFromUserEntered">

                        <textarea v-model="userEnteredParametersString" spellcheck="false" 
                        class="tw-p-2 tw-text-white tw-shadow-xl tw-border-table-header-background tw-bg-table-header-background tw-rounded tw-col-span-6">
                        </textarea>

                        <button class="tw-p-2 focus:tw-outline-none" id="copyToClipboard" v-on:click.prevent="copyToClipboard(userEnteredParametersString)">
                            <i class="fa fa-clipboard"></i>
                        </button>


                    </div>
                    

                </template>
            </expandable-sidebar>
        </div>

        <div class="copied">
            <p class=" tw-rounded-full tw-h-6 tw-mt-1 tw-ml-4 tw-pt-1 tw-pl-3 tw-pr-3 
                        tw-text-white tw-font-bold tw-bg-black tw-transition-opacity tw-duration-300 tw-ease-in"
                        :class="{
                            'tw-opacity-50': isCopied,
                            'tw-opacity-0': !isCopied,
                            }">
          Copied!</p>
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
                        class="tw-block tw-pl-5 tw-pr-10 tw-p-2.5 tw-appearance-none 
                        tw-text-gray-700 tw-bg-white tw-border 
                        hover:tw-border-gray-500 tw-px-4 tw-rounded-xl tw-shadow tw-leading-tight focus:tw-outline-none 
                        focus:tw-shadow-outline"
                        placeholder="Press Enter to Search Prefix" required>

                        <button 
                            v-on:click="onPrefixSearch"
                            class="tw-flex tw-absolute tw-inset-y-0 tw-right-0 tw-items-center tw-ml-3 tw-p-1 tw-rounded-xl"
                                :class="{
                            'tw-bg-content-active': isLoading,
                            'tw-bg-content-sub-header-background tw-text-white': !isLoading,
                            }">
                            <svg aria-hidden="true" class="tw-w-5 tw-h-5 tw-text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                </div>
                <button
                    v-on:click="getFavourites"
                    class="tw-mt-10 tw-items-center tw-block tw-pl-5 tw-pr-5 tw-h-6 tw-ml-2
                    tw-shadow tw-text-xs
                    tw-rounded-full tw-shadow" 
                    :class="{
                    'tw-bg-content-active': showFavourites,
                    'tw-bg-content-sub-header-background tw-text-white': !showFavourites,
                    }" type="button">
                    <p>Favourites</p></button>
                <button
                    v-on:click="downloadFile"
                    class="tw-mt-10 tw-items-center tw-block tw-pl-5 tw-pr-5 tw-h-6 tw-ml-2 tw-mr-2 
                    tw-text-white tw-bg-content-sub-header-background tw-shadow tw-text-xs
                    tw-rounded-full tw-shadow" type="button">
                    <p>Export CSV</p></button>
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
                        tw-w-44 tw-bg-white tw-rounded tw-divide-y tw-divide-gray-100 tw-shadow
                        tw-transition tw-ease-out tw-duration-100"
                        :class="isHidden ? 'tw-transform tw-opacity-0 tw-scale-95 tw-z-20' : 'tw-transform tw-opacity-100 tw-scale-100 tw-z-50'">
                        
                            <ul class="tw-py-1 tw-text-sm tw=text-gray-700" aria-labelledby="dropdownInformationButton">
                            <li> 
                                <div v-for="(value, index) in summaryColumns" :key="value.id" 
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
      
                                    <p v-if="index <= pillIndex"
                                    class="tw-rounded-full tw-h-6 tw-max-w-xs tw-ml-1 tw-pt-1 
                                    tw-pr-1 tw-pl-1 tw-bg-content-active ">
                                    <button v-on:click="togglePills(title)" class="fa fa-times tw-text-black"></button>
                                    {{ title }} </p>
                                </div>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>


        <div v-if="isLoading" role="status">
                <svg class="status tw-text-teal-200 tw-fill-current tw-animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                        </path>
                    </svg>
                <span class="sr-only">Loading...</span>
        </div>


        <div class="tw-overflow-x-scroll tw-scrolling-touch tw-z-20 tw-mt-2">

            <table class="summary-result-table tw-w-full">
                <thead>
                    <tr >
                        <th class="tw-bg-table-header-background tw-text-table-header-color"></th>
                        <th scope="col" v-for="(value, index) in summaryColumns" :key="value.id"
                            class="tw-bg-table-header-background tw-text-table-header-color tw-font-bold">
                          <p v-if="value.checked" :class="'tw-w-1/' + selectedColumns.length + ' tw-flex tw-text-center tw-pt-5 tw-pb-5 tw-pl-12 tw-pr-2'">
                          {{ value.title }}
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
                        </p>
                        </th>
                    </tr>
                </thead> 
                <tbody v-for="(result, rowIndex) in summaryData" :key="result.id">
                    <tr> 
                        <td class="tw-flex tw-pl-4 tw-pt-6 tw-pb-8 "
                            :class="{
                                'tw-bg-table-body-background-odd' : rowIndex % 2,
                                'tw-bg-content-sub-header-background' : isOdd % 2,
                            }">
                            <button class="tw-ra tw-ml-1" title="Click to add this data collection to the list of favourite data collections"
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
                            </p>
                        </td>
                        <td v-for="(value) in summaryColumns" :key="value.id"
                        :class="{
                                'tw-bg-table-body-background-odd' : rowIndex % 2,
                                'tw-bg-content-sub-header-background' : isOdd % 2,
                            }">
                            <div class="tw-flex">
                                <p v-if="value.checked == true && value.key != 'PROCESSINGPROGRAMS'" 
                                :class="'tw-w-1/' + selectedColumns.length + ' tw-text-center tw-pt-5 tw-pb-5 tw-pl-12 tw-pr-2'"
                                > {{ getProcRow(value.key, result)[0] }} </p>
                                <p v-if="value.checked == true && value.key == 'PROCESSINGPROGRAMS'" 
                                :class="'tw-w-1/' + selectedColumns.length + ' tw-text-center tw-pt-5 tw-pb-5 tw-pl-12 tw-pr-2'">
                                    <button  v-on:click="toggleExpandAutoProc(rowIndex)"
                                            class="tw-flex  tw-rounded-full tw-h-6 tw-max-w-xs tw-ml-1 tw-pt-1 
                                            tw-pr-2 tw-pl-2 tw-bg-content-active"
                                            >{{ getProcRow(value.key, result)[0] }}
                                            <svg
                                                class="tw-w-3 tw-h-4 tw-ml-1 tw-transition-all tw-duration-200 tw-transform"
                                                :class="{
                                                    'tw-rotate-0': !result.isVisible,
                                                    'tw-rotate-180': result.isVisible,
                                                }"
                                                fill="none"
                                                stroke="currentColor"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 16 10"
                                                aria-hidden="true"
                                                >
                                                <path
                                                    d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                />
                                            </svg>
                                    </button> 
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr  class="tw-overflow-y-scroll  tw-scrolling-touch">
                        <td></td>
                        <td v-for="(value) in summaryColumns" :key="value.id"
                            class="tw-relative
                            tw-ease-in-out tw-transition-all tw-delay-150 tw-duration-300"
                            :class="{
                                'tw-h-56': result.isVisible,
                                'tw-h-0': !result.isVisible,
                        }" >                  
                            <tr v-for="(procRow) in getProcRow(value.key, result)" :key="procRow.id">
                                <p v-show="result.loadContent" v-if="value.checked == true"
                                :class="'tw-w-1/' + selectedColumns.length + ' tw-text-center tw-pt-5 tw-pb-5 tw-pl-12 tw-pr-2'"
                                >{{ procRow }}</p>
                            </tr>
                        </td>
                    </tr>
                </tbody>



            </table>
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
            pillIndex : 2,
            isLoading : false,
            isCopied : false,
            isHidden: true,
            showFavourites: false,
            totalRecords:  10,
            pageSize: 15,
            currentPage: 1,
            summaryCollection : null,
            summaryData : [],
            summaryExport : [],
            proposalCollection : null,
            proposals : [],
            userEnteredParameters : [],
            userEnteredParametersString : '',
            deselectedColumns: [],
            selectedColumns: [],
            expandProcessing : false,
            summaryColumns: [
                {
                    key: "DATACOLLECTIONID",
                    title: 'Data Collection Id',
                    descParam : 'descdcid',
                    ascParam : 'ascdcid',
                },
                {
                    key: "FILETEMPLATE",
                    title: 'Prefix',
                    descParam : 'descpref',
                    ascParam : 'ascpref',
                },
                {
                    key: "_NAME",
                    title: 'Sample Name',
                    descParam : 'descsmpl',
                    ascParam : 'ascsmpl',
                },
                {
                    key: "STARTTIME",
                    title: 'Start Time',
                    descParam : 'descstdt',
                    ascParam : 'ascstdt',
                },
                {
                    key: "PROCESSINGPROGRAMS",
                    title: 'Processing Pipeline',
                    descParam : 'descpp',
                    ascParam : 'ascpp',
                },
                {
                    key: "SPACEGROUP",
                    title: 'Space Group',
                    descParam : 'descsg',
                    ascParam : 'ascsg',
                },
                {
                    key: "REFINEDCELL_A",
                    title: 'Unit Cell A',
                    descParam : 'descrca',
                    ascParam : 'ascrca',
                },
                {
                    key: "REFINEDCELL_B",
                    title: 'Unit Cell B',
                    descParam : 'descrcb',
                    ascParam : 'ascrcb',
                },
                {
                    key: "REFINEDCELL_C",
                    title: 'Unit Cell C',
                    descParam : 'descrcc',
                    ascParam : 'ascrcc',
                },
                {
                    key: "REFINEDCELL_ALPHA",
                    title: 'Unit Cell Alpha',
                    descParam : 'descrca',
                    ascParam : 'ascrca',
                },
                {
                    key: "REFINEDCELL_BETA",
                    title: 'Unit Cell Beta',
                    descParam : 'descrcb',
                    ascParam : 'ascrcb',
                },
                {
                    key: "REFINEDCELL_GAMMA",
                    title: 'Unit Cell Gamma',
                    descParam : 'descrcc',
                    ascParam : 'ascrcc',
                },
                // ----------------------------------------------------
                {
                    key: "RMEASWITHINIPLUSIMINUS_INNER",
                    title: 'RMeas (Inner)',
                    descParam : 'descrmeasin',
                    ascParam : 'ascrmeasin',
                },
                {
                    key: "RMEASWITHINIPLUSIMINUS_OUTER",
                    title: 'RMeas (Outer)',
                    descParam : 'descrmeasou',
                    ascParam : 'ascrmeasou',
                },
                {
                    key: "RMEASWITHINIPLUSIMINUS_OVERALL",
                    title: 'RMeas (Overall)',
                    descParam : 'descrmeasov',
                    ascParam : 'ascrmeasov',
                },
                {
                    key: "RESOLUTIONLIMITHIGH_INNER",
                    title: 'Resolution Limit High (Inner)',
                    descParam : 'descrlhin',
                    ascParam : 'ascrlhin',
                },
                {
                    key: "RESOLUTIONLIMITHIGH_OUTER",
                    title: 'Resolution Limit High (Outer)',
                    descParam : 'descrlhou',
                    ascParam : 'ascrlhou',
                },
                {
                    key: "RESOLUTIONLIMITHIGH_OVERALL",
                    title: 'Resolution Limit High (Overall)',
                    descParam : 'descrlhov',
                    ascParam : 'ascrlhov',
                },
                {
                    key: "CCANOMALOUS_INNER",
                    title: 'CC Anomalous (Inner)',
                    descParam : 'descccain',
                    ascParam : 'ascccain',
                },
                {
                    key: "CCANOMALOUS_OUTER",
                    title: 'CC Anomalous (Outer)',
                    descParam : 'descccaou',
                    ascParam : 'ascccaou',
                },
                {
                    key: "CCANOMALOUS_OVERALL",
                    title: 'CC Anomalous (Overall)',
                    descParam : 'descccaov',
                    ascParam : 'ascccaov',
                },
                {
                    key: "RFREEVALUESTART_INNER",
                    title: 'R Free Initial (Inner)',
                    descParam : 'descrfsin',
                    ascParam : 'ascrfsin',
                },
                {
                    key: "RFREEVALUESTART_OUTER",
                    title: 'R Free Initial (Outer)',
                    descParam : 'descrfsou',
                    ascParam : 'ascrfsou',
                },
                {
                    key: "RFREEVALUESTART_OVERALL",
                    title: 'R Free Initial (Overall)',
                    descParam : 'descrfsov',
                    ascParam : 'ascrfsov',
                },
                {
                    key: "RFREEVALUEEND_INNER",
                    title: 'R Free Final  (Inner)',
                    descParam : 'descrfein',
                    ascParam : 'ascrfein',
                },
                {
                    key: "RFREEVALUEEND_OUTER",
                    title: 'R Free Final (Outer)',
                    descParam : 'descrfeou',
                    ascParam : 'ascrfeou',
                },
                {
                    key: "RFREEVALUEEND_OVERALL",
                    title: 'R Free Final (Overall)',
                    descParam : 'descrfeov',
                    ascParam : 'ascrfeov',
                },
            ],
            filterOptions: {
                SPACEGROUP : {
                    title: 'Space Group',
                    inputtype: 'combo-box',
                    textField: "SPACEGROUPNAME",
                    valueField: "SPACEGROUPNAME",
                    data: []
                },
                PROCESSINGPIPELINE : {
                    title: 'Processing Pipeline',
                    inputtype: 'combo-box',
                    textField: "NAME",
                    valueField: "NAME",
                    data: []
                },
                RESLIMITHIGH_OUTER : {
                    title: 'Resolution Limit High (Outer)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrlhou',
                    paramGt: 'grlhou',

                },
                RMEASWIPLUSIMINUS_OUTER : {
                    title: 'Rmeas (Outer)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrmou',
                    paramGt: 'grmou',

                },
                CCANOM_OUTER : {
                    title: 'CC Anomalous (Outer)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lccou',
                    paramGt: 'gccou',

                },
                RFREEINITIAL_OUTER : {
                    title: 'RFree Initial (Outer)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrfiou',
                    paramGt: 'grfiou',

                },
                RFREEFINAL_OUTER : {
                    title: 'RFree Final (Outer)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrffou',
                    paramGt: 'grffou',

                },
                // ----------------------------
                RESLIMITHIGH_INNER : {
                    title: 'Resolution Limit High (Inner)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrlhin',
                    paramGt: 'grlhin',

                },
                RMEASWIPLUSIMINUS_INNER : {
                    title: 'Rmeas (Inner)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrmin',
                    paramGt: 'grmin',

                },
                CCANOM_INNER : {
                    title: 'CC Anomalous (Inner)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lccin',
                    paramGt: 'gccin',

                },
                RFREEINITIAL_INNER : {
                    title: 'RFree Initial (Inner)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrfiin',
                    paramGt: 'grfiin',

                },
                RFREEFINAL_INNER : {
                    title: 'RFree Final (Inner)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrffin',
                    paramGt: 'grffin',

                },
                // ----------------------------
                RESLIMITHIGH_OVERALL : {
                    title: 'Resolution Limit High (Overall)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrlhov',
                    paramGt: 'grlhov',

                },
                RMEASWIPLUSIMINUS_OVERALL : {
                    title: 'Rmeas (Overall)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrmov',
                    paramGt: 'grmov',

                },
                CCANOM_OVERALL : {
                    title: 'CC Anomalous (Overall)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lccov',
                    paramGt: 'gccov',

                },
                RFREEINITIAL_OVERALL : {
                    title: 'RFree Initial (Overall)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrfiov',
                    paramGt: 'grfiov',

                },
                RFREEFINAL_OVERALL : {
                    title: 'RFree Final (Overall)',
                    inputtype: 'greater-than-less-than',
                    paramLt: 'lrffov',
                    paramGt: 'grffov',

                },
            },
            selectedProposal : '',
            searchedGtUnitCellA : '',
            searchedLtUnitCellA : '',
            searchedGtUnitCellB : '',
            searchedLtUnitCellB : '',
            searchedGtUnitCellC : '',
            searchedLtUnitCellC : '',
            tempSamplePrefix : '',
            searchedSamplePrefix : '',
        }
    },
    created() {
        this.mapSummaryColumns()
        this.mapFilterOptions()
        this.searchProposal()
        this.getSpaceGroupsCollection()
        this.getProcessingPipelinesCollection() 
        this.populateSelectedColumns()
    },
    mounted() {
        this.mapUserEnteredParameters()
        window.onerror = (msg) => {
            alert('Error message: '+msg);
            return true;
        }
        window.addEventListener('resize', () => {
            this.windowWidth = window.innerWidth;
        })
    },
    methods: {
        mapSummaryResults() {
                this.summaryData = 
                this.summaryData.map((e) => {
                return { ...e, isVisible: false, loadContent: false };
            })
        },
        mapSummaryColumns() {
            this.summaryColumns = 
                this.summaryColumns.map((e) => {
                return { ...e, checked: true, isDesc : false, orderByCount: 2};
            })
        },
        mapFilterOptions() {
            Object.keys(this.filterOptions).forEach(title => {

                if(this.filterOptions[title].inputtype == 'combo-box') {
                    this.filterOptions[title] = 
                    {...this.filterOptions[title], key: title, selectedValue: ''};
                }
                if(this.filterOptions[title].inputtype== 'greater-than-less-than') {
                    this.filterOptions[title] = 
                    {...this.filterOptions[title], key: title, filteredLt: '',
                    filteredGt: ''};
                }

            });
        },
        mapUserEnteredParameters() {

            this.userEnteredParameters = [];

            this.userEnteredParameters.push(
                {title: "PROP", search_value: this.selectedProposal},
                {title: "REFINEDCELL_A", greater_than: this.searchedGtUnitCellA, less_than: this.searchedLtUnitCellA},
                {title: "REFINEDCELL_B", greater_than: this.searchedGtUnitCellB, less_than: this.searchedLtUnitCellB},
                {title: "REFINEDCELL_C", greater_than: this.searchedGtUnitCellC, less_than: this.searchedLtUnitCellC});


            Object.values(this.filterOptions).forEach(value => {
                if(value.inputtype == 'combo-box') {
                    this.userEnteredParameters.push({
                        title: value.key, search_value: value.selectedValue});
                }
                if(value.inputtype == 'greater-than-less-than') {
                    this.userEnteredParameters.push({
                        title: value.key, greater_than: value.filteredGt, less_than: value.filteredLt});
                }
                
            });

            console.log(this.userEnteredParameters)

            this.userEnteredParametersString = JSON.stringify(this.userEnteredParameters)

        },
        async toggleOrderBy(column) {
            // toggles order by - ascending and descending which is specified in summary columns. changes svg depending on orderByCount
            try {
                this.isLoading = true;

                this.summaryColumns[column].isDesc = !this.summaryColumns[column].isDesc;
                this.summaryColumns[column].orderByCount += 1;


                if (this.summaryColumns[column].orderByCount > 2) {
                    this.summaryColumns[column].orderByCount = 0;
                    this.summaryColumns[column].isDesc = false;
                    };

                this.getQueryParams(false);

                const results = await this.$store.dispatch('getCollection', this.summaryCollection);

                this.summaryData = results.toJSON();

                this.mapSummaryResults();

                this.isLoading = false;

            } catch(e) {                
                
                window.onerror('Cannot Order By: ' + e);
                this.isLoading = false;
                return ;

            }

        },
        async searchProposal() {

            // gets proposal list for combo box from proposal collection 
            try {

                this.isLoading = true;

                this.proposalCollection = new ProposalCollection();
                this.proposalCollection.queryParams.s = this.proposalText;
                this.proposalCollection.state.pageSize = 1999;

                const results = await this.$store.dispatch('getCollection', this.proposalCollection);
                this.proposals = results.toJSON();

                this.isLoading = false;

            } catch(e) {

                window.onerror('Cannot get Proposals Collection: ' + e);
                this.isLoading = false;
                return ;

            }


        },
        async getSpaceGroupsCollection() {
            // gets space group list for combo box from space group collection 
            try {
                this.isLoading = true;

                this.spaceGroupsCollection = new SpaceGroups(null, { state: { pageSize: 9999 } })
                if (!this.SPACEGROUP) {
                    this.spaceGroupsCollection.queryParams.ty = this.containerGroup
                }

                const result = await this.$store.dispatch('getCollection', this.spaceGroupsCollection)
                this.filterOptions.SPACEGROUP.data = result.toJSON()

                this.isLoading = false;
                 
            } catch (e) {

                window.onerror('Cannot get space group collection: ' + e);
                this.isLoading = false;
                return ;


            }
        },
        async getProcessingPipelinesCollection() {
            // gets processing pipelines list for combo box from processing pipeline collection 
            try {
                this.isLoading = true;

                let processingPipelinesCollection = new ProcessingPipelines()

                const result = await this.$store.dispatch('getCollection', processingPipelinesCollection)
                this.filterOptions.PROCESSINGPIPELINE.data = result.toJSON()

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

                this.getQueryParams(false);

                const results = await this.$store.dispatch('getCollection', this.summaryCollection);

                this.totalRecords = results.state.totalRecords;
                this.summaryData = results.toJSON();

                console.log(this.summaryData)

                this.mapSummaryResults()

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

                this.currentPage = data.currentPage;
                this.pageSize = data.pageSize;

                if (this.selectedProposal){

                    this.getQueryParams(false);

                    const results = await this.$store.dispatch('getCollection', this.summaryCollection);
                    this.summaryData = results.toJSON();

                    this.mapSummaryResults()

                };

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

                if (this.summaryData) {
                    this.getQueryParams(true);

                    const results = await this.$store.dispatch('getCollection', this.summaryCollection);
                    this.summaryExport = results.toJSON();

                    const csv = this.convertToCSV(this.summaryExport);
                    this.exportCSV(csv);

                    this.summaryExport = [];
                }

            } catch(e) {
                
                window.onerror('Cannot download csv: ' + e);
                return ;
                
            }

        },
        async favourite(result) {
            // adds favourites by adding a _FLAG_ comment to DataCollection comments table. updatetype is always specified as a 'POST' rather than 'PATCH' due to some errors in 
            // api not pushing data to 'patch' endpoint. if patching the endpoint we point to dc/patchcomments, which will patch (UPDATE) through sql code. 
            try {
                var dispatchUrl = '/dc/patchcomments';

                if(result.DC_COMMENTS == null) {
                    result.DC_COMMENTS = '';

                    dispatchUrl = '/dc/comments';
                }

                result.DC_COMMENTS = this.isFavourite(result) ?
                            result.DC_COMMENTS.replace('_FLAG_','').trim() :
                            result.DC_COMMENTS.trim() + ' _FLAG_'


                await this.$store.dispatch('updateDataToApi', {
                    url: dispatchUrl,
                    updateType: 'POST',
                    data: {
                        DATACOLLECTIONID: Number(result.DATACOLLECTIONID),
                        PERSONID: Number(result.PERSONID),
                        COMMENTS: result.DC_COMMENTS
                    },
                    requestType: 'updating comment for dc favourites'
                }).then(
                    (response) => {
                        console.log('favourited!')
                    }
                )

            }
            catch (e) {

                window.onerror('Cannot favourite: ' + e);
                return ;
            
            }
        },
        async getFavourites() {
        // gets favourites based on whether the DataCollection comments table contains _FLAG_ in its comments.  
            try{
                this.showFavourites = !this.showFavourites;

                if (this.showFavourites) {
                this.isLoading = true;

                this.summaryCollection = new SummaryCollection();

                this.summaryCollection.queryParams = { page: this.currentPage, per_page: this.pageSize };

                this.summaryCollection.queryParams.com = "_FLAG_";

                if (this.selectedProposal) {
                    this.summaryCollection.queryParams.prop = this.selectedProposal;
                }

                const results = await this.$store.dispatch('getCollection', this.summaryCollection);

                this.totalRecords = results.state.totalRecords;
                this.summaryData = results.toJSON();

                this.mapSummaryResults()

                this.isLoading = false;

                }else {
                    this.searchFilterParams();
                }

            } catch(e) {

                window.onerror('Cannot get favourites: ' + e);
                this.isLoading = false;
                return ;

            }

        },
        isFavourite(result) {
            if(!result.DC_COMMENTS) {
                return false;
            };
            return result.DC_COMMENTS.includes('_FLAG_');
        },
        getQueryParams(isexport) {
        // gets query params from summaryColumns or standalone variables i.e. selected Proposal etc. if this is an export then the pageSize will be for total records
        // rather than what is specified by the front page spinner. 
            console.log('getqueryparams')
            this.summaryCollection = new SummaryCollection()


            if (isexport) {
                this.summaryCollection.queryParams = { page: this.currentPage, per_page: this.totalRecords };
            }
            else {
                this.summaryCollection.queryParams = { page: this.currentPage, per_page: this.pageSize };
            }


            // loop through summaryColumns and assign variables for order by 
            for (var index in this.summaryColumns) {
                if(this.summaryColumns[index].orderByCount < 2 && this.summaryColumns[index].isDesc == true) {
                    var desc = this.summaryColumns[index].descParam;
                    this.summaryCollection.queryParams[desc] = 'desc';
                }
                else if(this.summaryColumns[index].orderByCount < 2 && this.summaryColumns[index].isDesc == false) {
                    var asc = this.summaryColumns[index].ascParam;
                    this.summaryCollection.queryParams[asc] = 'asc';
                }

            };

            // loop through filterOptions and assign variables
            for (var index in this.filterOptions) {
                if (this.filterOptions[index].filteredLt) {
                this.summaryCollection.queryParams[this.filterOptions[index].paramLt] = this.filterOptions[index].filteredLt;
                };
                if (this.filterOptions[index].filteredGt) {
                    this.summaryCollection.queryParams[this.filterOptions[index].paramGt] = this.filterOptions[index].filteredGt;
                }; 
            }



            if (this.selectedProposal) {
                this.summaryCollection.queryParams.prop = this.selectedProposal;
            }            
            if (this.searchedSamplePrefix) {
                this.summaryCollection.queryParams.sprefix = this.searchedSamplePrefix;
            }
            if (this.filterOptions.SPACEGROUP.selectedValue) {
                this.summaryCollection.queryParams.sg = this.filterOptions.SPACEGROUP.selectedValue;
            }
            if (this.filterOptions.PROCESSINGPIPELINE.selectedValue) {
                this.summaryCollection.queryParams.pp = this.filterOptions.PROCESSINGPIPELINE.selectedValue;
            }

            this.summaryCollection.queryParams.gca = this.searchedGtUnitCellA;
            this.summaryCollection.queryParams.lca = this.searchedLtUnitCellA;
            this.summaryCollection.queryParams.gcb = this.searchedGtUnitCellB;
            this.summaryCollection.queryParams.lcb = this.searchedLtUnitCellB;
            this.summaryCollection.queryParams.gc = this.searchedGtUnitCellC;
            this.summaryCollection.queryParams.lc = this.searchedLtUnitCellC;

 
        },
        clearQueryParams() {

            this.selectedProposal = '';
            this.searchedSamplePrefix = '';
            this.searchedGtUnitCellA = '';
            this.searchedLtUnitCellA = '';
            this.searchedGtUnitCellB = '';
            this.searchedLtUnitCellB = '';
            this.searchedGtUnitCellC = '';
            this.searchedLtUnitCellC = '';
            this.filterOptions.SPACEGROUP.selectedValue = '';
            this.filterOptions.PROCESSINGPIPELINE.selectedValue = '';


            for (var index in this.summaryColumns) {
                this.summaryColumns[index].filteredLt = '';
                this.summaryColumns[index].filteredGt = '';
            };

            
        },
        addToCombo(args) {
            // basic: adds new combo box option when click 'create new'. other methods 'post' to the collection but opted against that 
            // to avoid non-validated inserts to db. 

            if (args[0] == 'PROCESSINGPIPELINE'){
                this.filterOptions.PROCESSINGPIPELINE.selectedValue = args[1];
            }

            if (args[0] == 'SPACEGROUP'){
                this.filterOptions.SPACEGROUP.selectedValue = args[1];
            }
  
        },
        updateParamsFromUserEntered() {
            this.userEnteredParameters = eval(this.userEnteredParametersString);

            for (var value in this.userEnteredParameters ) {

                console.log(this.userEnteredParameters[value])
                
                if (this.userEnteredParameters[value].title == 'PROP') {
                    this.selectedProposal = this.userEnteredParameters[value].search_value;
                    continue;
                };
                if (this.userEnteredParameters[value].title == 'REFINEDCELL_A') {
                    this.searchedGtUnitCellA = this.userEnteredParameters[value].greater_than;
                    this.searchedLtUnitCellA = this.userEnteredParameters[value].less_than;
                    continue;
                };
                if (this.userEnteredParameters[value].title == 'REFINEDCELL_B') {
                    this.searchedGtUnitCellB = this.userEnteredParameters[value].greater_than;
                    this.searchedLtUnitCellB = this.userEnteredParameters[value].less_than;
                    continue;
                };
                if (this.userEnteredParameters[value].title == 'REFINEDCELL_C') {
                    this.searchedGtUnitCellC = this.userEnteredParameters[value].greater_than;
                    this.searchedLtUnitCellC = this.userEnteredParameters[value].less_than;
                    continue;
                };

                if (this.filterOptions[this.userEnteredParameters[value].title].filteredLt) {
                    this.filterOptions[this.userEnteredParameters[value].title].filteredLt =  this.userEnteredParameters[value].less_than;
                    this.filterOptions[this.userEnteredParameters[value].title].filteredGt =  this.userEnteredParameters[value].greater_than;                   
                };

                if (this.filterOptions[this.userEnteredParameters[value].title].selectedValue) {
                    this.filterOptions[this.userEnteredParameters[value].title].selectedValue = this.userEnteredParameters[value].search_value;
                };

            }

        },
        toggleExpandAutoProc(index) {

            this.summaryData[index].isVisible = !this.summaryData[index].isVisible;

            this.contentDelay(index)
        },
        contentDelay(index) {

            if (!this.summaryData[index].loadContent) { 
          setTimeout(() => this.summaryData[index].loadContent = true, 400);
          } else {
            setTimeout(() => this.summaryData[index].loadContent = false, 200);
          }

        },
        onPrefixSearch() {

            this.searchedSamplePrefix = this.tempSamplePrefix;
            this.searchFilterParams();

        },  
        populateSelectedColumns() {
            

            for (const value of Object.entries(this.summaryColumns)) {
                this.selectedColumns.push(value[1].title);
            };

            this.selectedColumns.reverse();

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
        copyToClipboard(textToCopy){
            navigator.clipboard.writeText(textToCopy);  
            
            this.isCopied = true;

            setTimeout(() => this.isCopied = false, 5000);
            
            
        },
        getProcRow(value, result) {
            // return an array for results, also change decimal places for floats
                if (result[value]) {
                    var dataArray = result[value].split(",");
                    

                    if( value !== 'DATACOLLECTIONID' && 
                        value !== 'FILETEMPLATE' &&
                        value !== 'STARTTIME' && 
                        value !== 'PROCESSINGPROGRAMS' && 
                        value !== 'SPACEGROUP'
                    ) {
                        if(value.includes('RESOLUTIONLIMIT')) {
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
        togglePills(value) {

            for (var index in this.summaryColumns) {

                if (this.summaryColumns[index].title == value)
                    this.checkedColumns(index);
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


        }



    },
    computed: {
        groupedOptions() {
            // chunks filter drop downs in advanced filter to chunks of 5 to fit into grid space easier. 
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
        },
        watchParams() {
            return `${this.selectedProposal}|${this.searchedGtUnitCellA}|${this.searchedLtUnitCellA}
            |${this.searchedGtUnitCellB}|${this.searchedLtUnitCellB}|${this.searchedGtUnitCellC}
            |${this.searchedLtUnitCellC}`;
        }

    },
    watch: {
        watchParams() {
            this.mapUserEnteredParameters();
        },
        filterOptions: {
            handler(val){
                this.mapUserEnteredParameters();
            },
            deep: true
        },
        windowWidth() {
            this.resizePills();
        }
    }

    
}

</script>


<style scoped>

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

</style>