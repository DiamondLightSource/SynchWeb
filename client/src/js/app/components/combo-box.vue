<!--
The combobox component combines the functionality of the traditional select input and text input fields to
allow the user to  select from a list of items and also search from the list.
The props explains the required items and also what they do in the component.
v-closable is a directive that is attached to the html element to listen for click event on the HTML document level.
The v-closable takes an object as argumnt with properties:
- excludeElements: An array or refs thatshould not trigger the closing of the combobox
- handler: A method that will handle the closing of the combobox component
-->
<template>
  <div
    v-closable="{
      handler: 'closeComboBox'
    }"
    class="custom-select-input tw-relative"
    :class="`combo-${inputIndex}`"
    :data-testid="dataTestId"
  >
    <div
      v-if="multiple==false"
      v-show="!searching"
      :class="{
        'select-selected': true,
        ['tw-px-2']: true,
        [`select-${inputIndex}`]: true,
        [size]: true,
        'disabled': isDisabled
      }"
      @click="openComboBox(inputIndex, $event)"
    >
      {{ selectedItemText ? selectedItemText : defaultText }}
    </div>
    <div
      v-if="multiple==true"
      v-show="!searching"
      class="tw-overflow-x-auto"
      :class="{
        'select-selected': true,
        ['tw-px-2']: true,
        [`select-${inputIndex}`]: true,
        [size]: true,
        'disabled': isDisabled
      }"
      @click="openComboBox(inputIndex, $event)"
    >
      {{ searchArray.length==0 ? defaultText : '' }}
      <div class="tw-flex" v-if="searchArray.length!==0" >
        <div v-for="value in searchArray" :key="value.id" class="pill-input">
        <p>{{ value[textField] }}</p></div>
        
      </div>
    </div>
    <div
      :ref="`select-items-${inputIndex}`"
      class="select-items select-hide"
      :class="{[`select-${inputIndex}`]: true}"
      v-if="multiple==false"
    >
      <div class="items-list">
        <div
          v-for="(option, optionIndex) in filteredOptions"
          :ref="`selectOption${inputIndex}${optionIndex}`"
          :key="`selectOptionIndex${optionIndex}`"
          :class="{ 'same-as-selected':
            value === String(option[valueField])
          }"
          class="tw-cursor-pointer tw-flex tw-w-full tw-justify-between item"
          :value="option[valueField]"
          @click.capture="selectOption(option[valueField], optionIndex)"
        >
          <slot :option="option">
            {{ option[textField] }}
          </slot>
        </div>
        <div
          v-if="filteredOptions.length > 0"
          class="tw-w-full tw-flex tw-flex-row tw-justify-center custom-add"
        >
          <button
            v-if="loadMore"
            class="button custom-add"
            @click.stop="handleMoreData"
          >
            Load More...
          </button>
          <p
            v-else
            class="tw-text-sm"
          >
            No more data 
          </p>
        </div>
        <div
          v-if="canCreateNewItem && filteredOptions.length < 1 && searchText.length > 0"
          class="tw-w-full tw-flex tw-flex-row tw-justify-center custom-add"
        >
          <button
            class="button custom-add"
            @click.stop="createNewOption"
          >
            Create New
          </button>
        </div>
      </div>
    </div>

    <div
      :ref="`select-items-${inputIndex}`"
      class="select-items select-hide"
      :class="{[`select-${inputIndex}`]: true}"
      v-if="multiple==true"
    >
      <div class="items-list-multiple ">
        <div
          v-for="(option, optionIndex) in filteredOptions"
          :ref="`selectOption${inputIndex}${optionIndex}`"
          :key="`selectOptionIndex${optionIndex}`"
          class="tw-cursor-pointer tw-flex tw-w-full tw-justify-between item-multiple"
          :class="valueArray.some(item => item[valueField] == option[valueField]) ? 'item-multiple-selected' : ''"
          :value="option[valueField]"
          @click="selectMultipleOption(option, optionIndex)"
        >
          <slot :option="option">
            {{ option[textField] }}
          </slot>
        </div>
        <div
          v-if="filteredOptions.length > 0"
          class="tw-w-full tw-flex tw-flex-row tw-justify-center custom-add"
        >
          <button
            v-if="loadMore"
            class="button custom-add"
            @click.stop="handleMoreData"
          >
            Load More...
          </button>
          <p
            v-else
            class="tw-text-sm"
          >
            No more data 
          </p>
        </div>
        <div
          v-if="canCreateNewItem && filteredOptions.length < 1 && searchText.length > 0"
          class="tw-w-full tw-flex tw-flex-row tw-justify-center custom-add"
        >
          <button
            class="button custom-add"
            @click.stop="createNewOption"
          >
            Create New
          </button>
        </div>
      </div>
    </div>


    <div
      v-show="searching"
      class="search-select"
    >
      <input
        v-if="multiple==false"
        v-model="searchText"
        type="text"
        class="tw-w-full select-search-input"
        :disabled="isDisabled"
        :class="{[size]: true}"
        @focus="openOptionsList($event)"
      >
      <div 
        tabindex="1"
        contenteditable
        v-if="multiple==true"
        class="tw-w-full tw-bg-white select-search-input"
        :disabled="isDisabled"
        :class="{[size]: true}"
        @focus="openOptionsList($event)"
        @input="onInput">
        <div class="something"></div>
        

      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import OutsideClickDirective from 'app/directives/outside-click.directive'
export default {
  name: 'ComboBox',
  mixins: [OutsideClickDirective],
  props: {
    // The list of data that will be displayed in the combobox
    data: {
      type: Array,
      required: true
    },
    // The property of the field to be used as value
    valueField: {
      type: String,
      required: true
    },
    // The property of the field to be used as the displayed text
    textField: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    valueArray: {
      type: Array,
      default: () => ([]),
      required: true
    },
    searchArray: {
      type: Array,
      default: () => ([]),
      required: true
    },
    defaultText: {
      type: String,
      default: 'Select an Item'
    },
    dataTestId: {
      type: String,
      required: false
    },
    inputIndex: {
      // InputIndex is used for keeping track of  how many combo-box elements we have on the current page
      // If you use a v-for to render this component let the inputIndex be the index of select item in the loop
      // It is useful if you want to control how the component behaves when the `closeComboBox` method is called
      type: Number
    },
    excludedSelectItemsIndices: {
      // This holds an array of the inputIndex values that you want to exclude from automatically closing when the
      // Select elements are closing
      type: Array,
      default: () => ([])
    },
    size: {
      // This is used for setting the size of the combo-box. The default is an empty string ''. The other option is to
      // set it to 'small'
      type: String,
      default: ''
    },
    excludeElementClassList: {
      type: Array,
      default: () => ([])
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    canCreateNewItem: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searching: false,
      searchText: '',
      searchInputClassName: 'select-search-input',
      excludedElementsClass: [],
      dataPagination: {
        total: 0,
        page: 1,
        perPage: 25
      }
    }
  },
  computed: {
    clonedData() {
      return cloneDeep(this.data)
    },
    filteredOptions() {
      const regex = new RegExp(this.searchText, 'i')

      const totalResults = this.clonedData.filter(option => {
        if (this.searchText.length < 1) return true

        const hasSearchText = option[this.textField].match(regex)
        return hasSearchText && hasSearchText.length > 0
      })

      this.dataPagination.total = totalResults.length
      return totalResults.slice(0, this.dataPagination.page * this.dataPagination.perPage)
    },
    selectedItemText() {
      const selectedItem = this.data.find(option => String(option[this.valueField]) === String(this.value))

      return selectedItem ? selectedItem[this.textField] : this.defaultText
    },
    loadMore() {
      return this.dataPagination.total > this.dataPagination.page * this.dataPagination.perPage
    },
  },
  watch: {
    excludeElementClassList: {
      handler() {
        this.setExcludedElementClass()
      },
      immediate: true
    },
    searchText(value) {
      this.$emit('handle-search-text', value)
      this.$emit('watch-list-change', {
        value: event.target.value,
        addNew: this.filteredOptions.length < 1
      })
    },
    value(newValue) {
      this.$emit('value-changed', newValue)
    }
  },
  methods: {
    openComboBox(index, event) {
      const { target } = event
      event.stopPropagation()
      if (this.isDisabled) { return }
      this.closeComboBox(false)
      this.searching = true
      target.nextElementSibling.classList.toggle('select-hide')
      target.classList.toggle('select-arrow-active')
      this.$nextTick(() => {
        const { parentElement } = target
        const { lastElementChild } = parentElement
        lastElementChild.children[0].focus()
      })
    },
    selectOption(value, optionIndex) {
      // The ref element will be stored in an array because of the way Vue 2 handles ref used in a v-for
      const element = this.$refs[`selectOption${this.inputIndex}${optionIndex}`][0]

      this.$emit('input', value)
      this.searching = false
      this.closeComboBox(false)

      element.parentElement.parentElement.classList.add('select-hide')
      element.parentElement.parentElement.previousElementSibling.classList.remove('select-arrow-active')
      this.searching = false
      this.searchText = ''
    },
    selectMultipleOption(value, optionIndex) {
      // The ref element will be stored in an array because of the way Vue 2 handles ref used in a v-for
      const element = this.$refs[`selectOption${this.inputIndex}${optionIndex}`][0]

      // element.classList.toggle('item-multiple-selected')

      this.$emit('input', value)
      this.addOptionArray(value)
      this.searching = false

    },
    closeComboBox(force = true) {
      // Loop through all the combobox elements and close every dropdown list
      const dropDownList = []
      const selectItemsWrapper = document.getElementsByClassName('select-items') // dropdown list wrapper element
      const selectedItemWrapper = document.getElementsByClassName('select-selected') // selected wrapper element
      for (let i = 0; i < selectedItemWrapper.length; i += 1) {
        dropDownList.push(i)
        const isSelfTriggered = this.$refs[`select-items-${this.inputIndex}`] && this.$refs[`select-items-${this.inputIndex}`].contains(event.target)
        if (!isSelfTriggered || force) {
          selectedItemWrapper[i].classList.remove('select-arrow-active') // Revert the arrow icon when closed
        }
      }

      for (let j = 0; j < selectItemsWrapper.length; j += 1) {
        if (dropDownList.indexOf(j) > -1) {
          const isSelfTriggered = this.$refs[`select-items-${this.inputIndex}`] && this.$refs[`select-items-${this.inputIndex}`].contains(event.target)

          if (force) {
            this.searching = false
          }

          if (!isSelfTriggered || force) {
            selectItemsWrapper[j].classList.add('select-hide') // Hide the dropdown list in combobox
          }
        }
      }
    },
    addOptionArray: function (val) {

      const index = this.valueArray.findIndex(item => item[this.valueField] == val[this.valueField])
      if (index >= 0) {
        this.valueArray.splice(this.valueArray[index], 1)

        console.log('remove', this.valueArray)
      } else {
        this.valueArray.push(val)
        console.log('add', this.valueArray)
      }


    },
    openOptionsList(event) {
      event.stopPropagation()
      console.log('classlist', event.target.parentElement.previousElementSibling.classList)
      event.target.parentElement.previousElementSibling.classList.remove('select-hide')
      this.searching = true
    },
    setExcludedElementClass() {
      this.excludedElementsClass = [this.searchInputClassName].concat(this.excludeElementClassList)
    },
    handleMoreData() {
      const hasNextPage = this.dataPagination.total - (this.dataPagination.perPage * this.dataPagination.page)

      if (hasNextPage) {
        this.dataPagination.page += 1
      }
    },
    createNewOption() {
      this.$emit('create-new-option', this.searchText)
    },
    onInput(e) {
      this.searchText=e.target.innerText
    }
  }
}
</script>

<style scoped>
.select-selected {
  @apply tw-bg-white tw-h-8 tw-rounded tw-border tw-border-content-dark-background tw-flex tw-items-center tw-cursor-pointer
}

.select-selected-multiple {
  @apply tw-bg-white tw-h-8 tw-rounded tw-border tw-border-content-dark-background tw-flex tw-items-center tw-cursor-pointer
}
.select-selected.disabled {
  @apply tw-bg-content-page-background
}
.select-selected.small {
  height: 30px;
  font-size: 14px;
}
.select-selected.small:after, .select-selected.small:before {
  top: 15px;
}
/* Style the arrow inside the select element: */
.select-selected:before, .select-selected:after {
  position: absolute;
  content: "";
  top: 20px;
  width: 5px;
  height: 2px;
  @apply tw-bg-black;
}
.select-selected:before {
  right: 20px;
  transform: skew(0deg, 45deg);
  -ms-transform: skew(0deg, 45deg);
  -webkit-transform: skew(0deg, 45deg);
  -moz-transform: skew(0deg, 45deg);
}
.select-selected:after {
  right: 15px;
  transform: skew(0deg, -45deg);
  -ms-transform: skew(0deg, -45deg);
  -webkit-transform: skew(0deg, -45deg);
  -moz-transform: skew(0deg, -45deg);
}
/* Point the arrow upwards when the select box is open (active): */
.select-selected.select-arrow-active:after {
  transform: skew(0deg, 45deg);
  -ms-transform: skew(0deg, 45deg);
  -webkit-transform: skew(0deg, 45deg);
  -moz-transform: skew(0deg, 45deg);
}
.select-selected.select-arrow-active:before {
  transform: skew(0deg, -45deg);
  -ms-transform: skew(0deg, -45deg);
  -webkit-transform: skew(0deg, -45deg);
  -moz-transform: skew(0deg, -45deg);
}
/* style the items (options), including the selected item: */
.items-list > div {
  @apply tw-py-2 tw-px-2 tw-cursor-pointer tw-text-black;
}
.items-list-multiple > div {
  @apply tw-py-2 tw-px-2 tw-cursor-pointer tw-text-black;
}
/* Style items (options): */
.select-items {
  @apply tw-absolute tw-bg-white;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
  border-right: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
  border-left: 1px solid #E5E5E5;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  -moz-border-radius-bottomright: 4px;
  -moz-border-radius-bottomleft: 4px;
  -webkit-border-bottom-right-radius: 4px;
  -webkit-border-bottom-left-radius: 4px;
}
/* Hide the items when the select box is closed: */
.select-hide {
  display: none;
}
.items-list .item:hover, .same-as-selected {
  @apply tw-bg-content-active tw-text-white;
}

.items-list-multiple .item-multiple:hover {
  @apply tw-bg-content-active tw-text-white;
}

.item-multiple-selected {
  @apply tw-bg-content-active tw-text-white;
}
.select-search-input.small {
  @apply tw-h-8;
}
.select-search-input {
  @apply tw-h-12;
}

.pill-input {
  white-space: nowrap;
  @apply tw-rounded-full tw-h-6 tw-max-w-xs tw-ml-1 tw-px-2 tw-py-1 tw-bg-content-active tw-text-sm
}

::-webkit-scrollbar {
  height: 2px;
  width: 2px;
  background-color: rgb(77, 118, 255);
}


</style>
