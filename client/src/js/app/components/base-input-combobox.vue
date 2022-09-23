<!--
Comboxbox Wrapper

Options is a JSON object with at least two name:value pairs
Pass in the key used to provide the value attribute and the key used for the display text
So if the options were: [ { 'NAME': 'Green', 'ID': 0 }, { 'NAME': 'Yellow', 'ID': 1 } ]
...and the optionTextKey = NAME, optionValueKey = ID
...would result in: <option value="0">Green</option>

For the combobox the select and options are used to build a div with an input followed by a list of items.

Slots include:
- description = override sub title for the label
- error-msg = place to show error messages
- actions = place to show action buttons
-->
<template>
  <div :class="outerClass">
    <!-- The label which includes an optional subtitle -->
    <label
      v-if="label"
      :for="id"
    >{{ label }}
      <slot name="description">
        <span
          v-if="description"
          class="small"
        >{{ description }}</span>
      </slot>
    </label>

    <!--
      The form input itself - bound to the v-model passed in 
      Note for a combobox this will never be shown.
    -->
    <select
      :id="id"
      ref="inputRef"
      hidden
      :name="name"
      :value="localValue"
      :disabled="disabled"
      :class="classObject"
      @input="updateValue"
      @change="updateValue"
      @focus="$emit('focus')"
    >
      <option
        v-show="defaultText"
        disabled
        value=""
      >
        {{ defaultText }}
      </option>
      <option
        v-for="option in options"
        :key="option[optionValueKey]"
        :value="option[optionValueKey]"
        :class="getOptionClass(option[optionClassKey])"
      >
        {{ option[optionTextKey] }}
      </option>
    </select>

    <span
      v-if="inline && !editable"
      class="btn-edit"
      @click="onEdit"
      @mouseover="showEditIcon = true"
      @mouseleave="showEditIcon = false"
    >{{ inlineText }} <span v-show="showEditIcon"><i :class="['fa', 'fa-edit']" /> Edit</span></span>
    <button
      v-if="inline && editable"
      class="button"
      @mousedown="onSave"
    >
      OK
    </button>
    <!-- Use a cancel button with inline edit mode - because getting the combobox to play with onblur events tricky -->
    <button
      v-if="inline && editable"
      class="button"
      @mousedown="onCancel"
    >
      Cancel
    </button>

    <!-- Placeholder for any error message placed after the input -->
    <slot name="error-msg">
      <span
        v-show="errorMessage"
        :class="errorClass"
      >{{ errorMessage }}</span>
    </slot>

    <!-- Placeholder for any buttons that should be placed after the input -->
    <slot name="actions" />
  </div>
</template>

<script>
import 'jquery-ui.combobox'

export default {
  name: 'BaseInputCombobox',
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    optionValueKey: {
      type: String,
      required: true
    },
    optionTextKey: {
      type: String,
      required: true
    },
    optionClassKey: {
      type: String,
      required: false,
      default: ''
    },
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    label: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    defaultText: {
      type: String,
      required: false
    },
    // Pass in class styling for input
    inputClass: {
      type: String,
    },
    errorClass: {
      type: String,
      required: false,
      default: 'ferror'
    },
    errorMessage: {
      type: String,
    },
    // Default behaviour is to act as normal input
    // Set inline to enable edit/save behaviour
    inline: {
      type: Boolean,
      default: false,
    },
    // For cases where you store an id but want the inline edit to show the text value
    // pass an initial text value in. This will render the text while the span is visible
    // Use the save event to update this prop
    initialText: {
      type: String,
    },
    // To recreate the previous combobox, pass a function that takes a value and returns a class string.
    // The value passed will be the option[optionsClassKey]
    classMapCallback: {
      type: Function,
      default: null,
    }
  },
  data() {
    return {
      editable: true,
      showEditIcon: false,
      localValue: this.value,
      comboBoxParent: null,
    }
  },
  computed: {
    // If a user passes in an error Message, add the error class to the input
    classObject() {
      return [ this.inputClass,  this.errorMessage ? this.errorClass : '']
    },
    inlineText() {
      return this.initialText || this.localValue
    }
  },
  watch: {
    // Because we are using a cached local value (for inline edit mode) we should react to the passed prop change
    value: function(newVal) {
      this.localValue = newVal
    },
    // This should only get changed if we are in inline edit mode
    editable: function(newVal) {
      if (newVal) this.showCombobox()
      else {
        this.hideCombobox()
        this.showEditIcon = false
      }
    }
  },
  created() {
    // If created with editable = false then we are in inline-edit mode
    this.editable = !this.inline
  },
  mounted: function() {
    if (this.editable) this.showCombobox()
  },
  methods: {
    showCombobox: function() {
      if (this.comboBoxParent) this.comboBoxParent.siblings('div.ui-combobox').show()
      else this.createComboBox()
    },
    createComboBox: function() {
      // Bind the combobox to the input control
      // In normal operation selecting an item updates the model
      // In inline-edit mode, only save when the OK button is clicked
      this.comboBoxParent = $('#'+this.id)
      this.comboBoxParent.combobox({ 
        select: this.onSelect,
      })
    },
    hideCombobox: function() {
      if (!this.comboBoxParent) return
      let element = this.comboBoxParent.siblings('div.ui-combobox')
      element.hide()
    },
    updateValue(event) {
      this.localValue = event.target.value

      if (!this.inline) this.$emit("input", this.localValue);
    },
    onCancel() {
      // If in inline edit mode cancel edit
      if (this.inline) {
        this.editable = false
        this.localValue = this.value
        this.hideCombobox()
      }
    },
    onEdit() {
      // this.$refs.inputRef.focus()
      this.editable = true
    },
    onSave() {
      this.editable = false
      // In this case we are in inline edit mode so need to explicitly save the input value
      this.$emit("input", this.localValue);
      this.$emit("save", this.localValue);
    },
    onSelect() {
      console.log("OnSelect")
      this.localValue = this.comboBoxParent.combobox('value') || null

      if (!this.inline) {
        this.$emit("save", this.localValue);
        this.$emit("input", this.localValue);
      }
    },
    getOptionClass: function(classValue) {
      if (!this.classMapCallback) return ""
      
      return this.classMapCallback(classValue)
    }
  }
};
</script>

<style scoped>
.btn-edit {
  cursor: pointer;
  @apply tw-rounded;
  @apply tw-inline-block;
}
.btn-edit:hover {
  @apply tw-bg-content-search-background;
}
</style>