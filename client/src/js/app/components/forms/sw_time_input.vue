<!--
Time picker
This converts an input text input type into a time picker using jquery-plugin
Intended to abstract the logic from how the time picker part works so we can migrate to something else in future
-->
<template>
  <div>
    <!-- The label which includes an optional subtitle -->
    <label v-if="label" :for="id">{{label}}
      <slot name="description">
        <span v-if="description" class="small">{{description}}</span>
      </slot>
    </label>

    <!-- The form input itself - bound to the v-model passed in -->
    <input
      :id="id"
      :name="name"
      type="text"
      :value="value"
      :disabled="disabled"
      :class="classObject"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    >
    <!-- Placeholder for any error message placed after the input -->
    <slot name="error-msg">
      <span v-show="errorMessage" :class="errorClass">{{ errorMessage }}</span>
    </slot>

    <!-- Placeholder for any buttons that should be placed after the input -->
    <slot name="actions"></slot>
  </div>
</template>

<script>
import 'jquery-ui.timepicker'

export default {
  name: "SwTimeInput",
  inheritAttrs: false,
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
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
    disabled: {
      type: Boolean,
      default: false
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
    }
  },
  computed: {
    // If a user passes in an error Message, add the error class to the input
    classObject() {
      return [ this.inputClass,  this.errorMessage ? this.errorClass : '']
    }
  },
  mounted: function() {
    var self = this
    $('#'+this.id).timepicker({
      onSelect: (timeText) => self.$emit("input", timeText)
    })
  }
};
</script>

