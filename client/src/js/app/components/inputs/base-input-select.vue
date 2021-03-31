<!--
Select Wrapper

Options is a JSON object with at least two name:value pairs
Pass in the key used to provide the value attribute and the key used for the display text
So if the options were: [ { 'NAME': 'Green', 'ID': 0 }, { 'NAME': 'Yellow', 'ID': 1 } ]
...and the optionTextKey = NAME, optionValueKey = ID
...would result in: <option value="0">Green</option>

Slots include:
- description = override sub title for the label
- error-msg = place to show error messages
- actions = place to show action buttons
-->
<template>
  <div :class="outerClass">

    <!-- The label which includes an optional subtitle -->
    <label v-if="label" :for="id">{{label}}
      <slot name="description">
        <span v-if="description" class="small">{{description}}</span>
      </slot>
    </label>

    <!-- The form input itself - bound to the v-model passed in -->
    <select
      v-show="editable"
      ref="inputRef"
      :id="id"
      :name="name"
      :value="localValue"
      :disabled="disabled"
      :class="classObject"
      @input="updateValue"
      @change="updateValue"
      @blur="onBlur"
      @focus="$emit('focus')"
    >
      <option v-show="defaultText" disabled value="">{{defaultText}}</option>
      <option v-for="option in options" :key="option[optionValueKey]" :value="option[optionValueKey]">{{option[optionTextKey]}}</option>
    </select>

    <span v-if="inline && !editable" class="btn-edit" @click="onEdit">{{ inlineText }} <span><i :class="['fa', 'fa-edit']"></i> Edit</span></span>
    <button v-if="inline && editable" @mousedown="onSave" class="button">OK</button>

    <!-- Placeholder for any error message placed after the input -->
    <slot name="error-msg">
      <span v-show="errorMessage" :class="errorClass">{{ errorMessage }}</span>
    </slot>

    <!-- Placeholder for any buttons that should be placed after the input -->
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "BaseInputSelect",
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
    },
    options: {
      type: Array,
      required:true
    },
    optionValueKey: {
      type: String,
      required: true
    },
    optionTextKey: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: false
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
    }
  },
  data() {
    return {
      editable: true,
      localValue: this.value
    }
  },
  watch: {
    // Because we are using a cached local value (for inline edit mode) we should react to the passed prop change
    value: function(newVal) {
      this.localValue = newVal
    },
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
  created() {
    // If created with editable = false then we are in inline-edit mode
    this.editable = !this.inline
  },
  methods: {
    updateValue(event) {
      this.localValue = event.target.value

      if (!this.inline) this.$emit("input", this.localValue);
    },
    onBlur() {
      // If in inline edit mode cancel edit
      if (this.inline) {
        this.editable = false
        this.localValue = this.value
      }
      this.$emit("blur")
    },
    onEdit() {
      this.$refs.inputRef.focus()

      this.editable = true
    },
    onSave() {
      this.editable = false
      // In this case we are in inline edit mode so need to explicitly save the input value
      this.$emit("input", this.localValue);
      this.$emit("save", this.localValue);
    },
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