<!--
Select Wrapper
Based on pattern from https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/

Options is a JSON object with at least two name:value pairs
Pass in the key used to provide the value attribute and the key used for the display text
So if the options were: [ { 'NAME': 'Green', 'ID': 0 }, { 'NAME': 'Yellow', 'ID': 1 } ]
...and the optionTextKey = NAME, optionValueKey = ID
...would result in: <option value="0">Green</option>

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
    <select
      :id="id"
      :name="name"
      :value="value"
      :disabled="disabled"
      :class="classObject"
      @input="updateValue"
      @change="updateValue"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    >
      <option v-show="defaultText" disabled value="">{{defaultText}}</option>
      <optgroup v-for="(group, index) in groups" :key="index" :label="group.name">
        <option v-for="option in group.options" :key="option[optionValueKey]" :value="option[optionValueKey]">{{option[optionTextKey]}}</option>
      </optgroup>
    </select>

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
  name: "SwSelectInput",
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
    },
    groups: {
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
    }
  },
  created: function() {
    console.log("Created group select with " + JSON.stringify(this.groups))
  },
  computed: {
    // If a user passes in an error Message, add the error class to the input
    classObject() {
      return [ this.inputClass,  this.errorMessage ? this.errorClass : '']
    }
  },
  methods: {
    updateValue(event) {
      this.$emit("input", event.target.value);
    },
  }
};
</script>

