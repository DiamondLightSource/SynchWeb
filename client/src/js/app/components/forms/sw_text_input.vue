<!--
Uses common pattern from SynchWeb with slots for defaults so you can override them
Slots include:
- description = sub title for the label
- error-msg = place to show error messages
- actions = place to show action buttons

Form component design taken from couple of articles
https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/
https://medium.com/@logaretm/authoring-validatable-custom-vue-input-components-1583fcc68314
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
      :type="type"
      :value="value"
      :disabled="disabled"
      :class="classObject"
      @input="updateValue"
      @change="updateValue"
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
export default {
  name: "SwTextInput",
  props: {
    value: { // Passed in automatically through v-model
      type: String,
      required: true
    },
    id: {
      type: String,
    },
    name: {
      type: String,
    },
    type: { // Allows a user to override the type so it could be password, number etc.
      type: String,
      default: 'text'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
    },
    description: {
      type: String,
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
  methods: {
    updateValue(event) {
      this.$emit("input", event.target.value);
    }
  }
};
</script>

