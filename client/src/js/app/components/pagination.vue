<!--
Pagination control
Sends a page-changed event with page number and page size as payload
  payload = {
    currentPage: this.currentPage,
    pageSize: this.perPage
  }
Set totalRecords(0), initalPage (1), pageSizes([]) and number of page links (0..5)
-->
<template>
    <div class="content">
        <select v-model="perPage" v-on:change="onPageSizeChange">
            <option v-for="(option, index) in pageSizes" v-bind:key="index" v-bind:value="option">{{option}}</option>
        </select>
        <button v-on:click="onFirst" class="button">
            <i class="fa fa-angle-double-left"></i>
        </button>
        <button v-on:click="onPrev" class="button">
            <i class="fa fa-angle-left"></i>
        </button>
        <button v-for="(page, index) in pages" :key="index" @click="onSetPage(page)" :class="['button tw-w-8 tw-mx-1 tw-px-2', page == currentPage ? 'tw-border tw-border-green-500' : '']">{{page}}</button>
        <button v-on:click="onNext" class="button">
            <i class="fa fa-angle-right"></i>
        </button>
        <button v-on:click="onLast" class="button">
            <i class="fa fa-angle-double-right"></i>
        </button>
    </div>
</template>

<script>
const MAX_PAGE_LINKS = 5

export default {
    name: 'Pagination',
    props: {
        initialPage: {
            type: Number,
            default: 1
        },
        totalRecords: {
            type: Number,
            default: 0
        },
        pageSizes: {
          type: Array,
          default: ['15', '25', '50', '100', '500'],
        },
        pageLinks: {
          type: Number,
          default: 0
        }
    },

    data: function() {
        return {
            currentPage: this.initialPage,
            perPage: this.pageSizes[0],
        }
    },
    computed: {
        // Calculate total number of pages
        maxPages: function() {
            if (this.totalRecords < 1) {
                return 1
            }
            return Math.ceil(this.totalRecords / this.perPage)
        },
        numberOfPageLinks: function() {
          if (this.pageLinks < 1) return 1
          if (this.pageLinks > this.maxPages) return this.maxPages
          // Max of 5 links total
          return Math.max(1, Math.min(this.pageLinks, MAX_PAGE_LINKS))
        },
        pages: function() {
          let lower = Math.max(1, this.currentPage - Math.floor(this.numberOfPageLinks/2))
          let upper = lower + this.numberOfPageLinks

          // If we hit the max pages, we need to reset our lower bound value
          if (upper >= this.maxPages) {
            upper = this.maxPages+1 // So when we grab the range its correct
            lower = Math.max(1, upper - this.numberOfPageLinks)
          }
          let range = upper - lower

          let result = Array.from({length: range}, (d,i) => lower+i)

          return result
        },
    },
    methods: {
        onFirst: function() {
            this.currentPage = 1
            this.sendPageChangeEvent()
        },
        onPrev: function() {
            this.currentPage = this.currentPage > 1 ? this.currentPage -1 : 1
            this.sendPageChangeEvent()
        },
        onNext: function() {
            this.currentPage = this.currentPage < this.maxPages ? this.currentPage + 1 : this.maxPages
            this.sendPageChangeEvent()
        },
        onSetPage: function(page) {
          this.currentPage = Math.min(page, this.maxPages)
          this.sendPageChangeEvent()
        },
        onLast: function() {
          this.currentPage = this.maxPages
          this.sendPageChangeEvent()
        },
        onPageSizeChange: function(event) {
          // Which page should we be on if the page size has changed?
          // For now set back to 1
          this.currentPage = 1
          this.sendPageChangeEvent()
        },
        sendPageChangeEvent: function() {
            let payload = {
                currentPage: +this.currentPage,
                pageSize: +this.perPage
            }
            this.$emit('page-changed', payload)
        }
    },

    created: function() {
        this.currentPage = Math.max(1, Math.min(this.initialPage, this.maxPages))
    },
}
</script>