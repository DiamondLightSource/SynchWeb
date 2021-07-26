<!--
The combobox component combines the functionality of the traditional select input and text input fields to
allow the user to  select from a list of items and also search from the list.
The props explains the required items and also what they do in the component. 

The excludedRefs is for preventing the closing of the combobox when you click on HTML element that is a part of the ref.
v-closable is a directive that is attached to the html element to listen for click event on the HTML document level.
The v-closable takes an object as argumnt with properties:
- excludeElements: An array or refs thatshould not trigger the closing of the combobox
- handler: A method that will handle the closing of the combobox component
-->
<template>
  <div class="custom-select-input tw-relative" v-closable="{
    excludeElements: [getExcludedRefs()],
    handler: 'closeComboBox'
  }">
    <div
      :class="{
        'select-selected': true,
        ['tw-px-2']: true,
        [`select-${inputIndex}`]: true
      }"
      v-show="!searching"
      @click="openComboBox(inputIndex, $event)" >
      {{ selectedItem[valueField] ? selectedItem[textField] : defaultText }}
    </div>
    <div class="select-items select-hide" :class="{[`select-${inputIndex}`]: true}">
      <div class="items-list">
        <div
          v-for="(option, optionIndex) in filteredOptions"
          :class="{ 'same-as-selected':
            selectedItem[valueField] === option[valueField]
          }"
          class="tw-cursor-pointer tw-flex tw-w-full tw-justify-between"
          :ref="`selectOption${optionIndex}`"
          :key="`selectOptionIndex${optionIndex}`"
          :value="option[valueField]"
          @click.stop="selectOption(option, $event)">
          <slot :option=option>{{ option[textField] }}</slot>
        </div>
      </div>
      
    </div>
    <div class="search-select" v-show="searching">
      <input
        type="text"
        :ref="`searchInput-${inputIndex}`"
        class="tw-w-full select-search-input"
        v-model="searchText"
        @focus="openOptionsList($event)"/>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import OutsideClickDirective from 'app/directives/outside-click.directive'
export default {
  name: 'combo-box',
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
    selectedItem: {
      type: Object,
      default: () => ({})
    },
    defaultText: {
      type: String,
      default: 'Select an Item'
    },
    inputIndex: {
      // InputIndex is used for keeping track of  how many combo-box elements we have on the current page
      // If you use a v-for to render this component let the inputIndex be the index of select item in the loop
      // It is useful if you want to control how the component behaves when the `closeComboBox` method is called
      type: Number
    },
    selectCount: {
      // This is the total number of combo-box component current visible on the page. If they are going to be rendered
      // dynamically, then set the value to the the total number of select component on the screen. Anytime a new element
      // is added to the page increase this number
      type: Number
    },
    disabled: {
      type: Boolean,
      default: false
    },
    excludedSelectItemsIndices: {
      // This holds an array of the inputIndex values that you want to exclude from automatically closing when the
      // Select elements are closing
      type: Array,
      default: () => ([])
    },
  },
  data() {
    return {
      searching: false,
      searchText: '',
      searchInputClassName: 'select-search-input'
    }
  },
  methods: {
    getExcludedRefs() {
      return Array(this.selectCount).fill('').map((item, index) => `searchInput-${index}`)
    },
    openComboBox(index, event) {
      event.stopPropagation()
      if (this.disabled) { return }
      this.closeComboBox(false)
      this.searching = true
      event.target.nextElementSibling.classList.toggle('select-hide')
      event.target.classList.toggle('select-arrow-active')
      this.$nextTick(() => {
        this.$refs[`searchInput-${index}`].focus()
      })
    },
    selectOption(value, event) {
      this.$emit('handle-select-event', value)
      this.searching = false
      this.closeComboBox(false)
      event.target.parentElement.parentElement.classList.add('select-hide')
      event.target.parentElement.parentElement.previousElementSibling.classList.remove('select-arrow-active')
      this.searching = false
      this.searchText = ''
    },
    closeComboBox(force = true) {
      // Loop through all the combobox elements and close every dropdown list
      const dropDownList = []
      const selectItemsWrapper = document.getElementsByClassName('select-items') // dropdown list wrapper element
      const selectedItemWrapper = document.getElementsByClassName('select-selected') // selected wrapper element

      for (let i = 0; i < selectedItemWrapper.length; i += 1) {
        dropDownList.push(i)
        var classNames = selectedItemWrapper[i].classList
        const isSelfTriggered = this.excludedSelectElements.some(element => classNames.contains(element))
        if (!isSelfTriggered || force) {
          selectedItemWrapper[i].classList.remove('select-arrow-active') // Revert the arrow icon when closed
        }
      }
      
      for (let j = 0; j < selectItemsWrapper.length; j += 1) {
        if (dropDownList.indexOf(j) > -1) {
          var classNames = selectItemsWrapper[j].classList
          const isSelfTriggered = this.excludedSelectElements.some(element => classNames.contains(element))
          
          if (force) {
            this.searching = false
          }
          if (!isSelfTriggered || force) {
            selectItemsWrapper[j].classList.add('select-hide') // Hide the dropdown list in combobox
          }
        }
      }
    },
    openOptionsList(event) {
      event.stopPropagation()
      event.target.parentElement.previousElementSibling.classList.remove('select-hide')
      this.searching = true
    },
  },
  computed: {
    filteredOptions() {
      const regex = new RegExp(this.searchText, 'i')
      return cloneDeep(this.data)
        .filter((option) => {
          const hasSearchText = option[this.textField].match(regex)
          if (hasSearchText && hasSearchText.length > 0) {
            return option
          }
        })
    },
    excludedSelectElements() {
      const selectListIndex = [...this.excludedSelectItemsIndices, this.inputIndex]
      return selectListIndex.map(index => `select-${index}`)
    },

  },
}
</script>

<style scoped>
.select-selected {
  @apply tw-bg-white tw-h-10 tw-rounded tw-border tw-border-content-dark-background tw-flex tw-items-center tw-cursor-pointer
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
.items-list div {
  @apply tw-py-3 tw-px-5 tw-cursor-pointer tw-text-black;
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
.items-list div:hover, .same-as-selected {
  @apply tw-bg-content-active tw-text-white;
}
</style>