<!-- VeeValidation Component -->
<template>
  <div>
    <label v-if="label" :for="id">{{label}}
      <span v-if="description" class="small">{{description}}</span>
      <slot name="description"></slot>
    </label>

    <ValidationProvider :rules="{is: 'Green'}" :name="name" :vid="id" v-slot="{ errors }">
      <select
        :id="id"
        :name="name"
        :value="value"
        @input="handleInput">
        <option v-show="defaultText" disabled value="">{{defaultText}}</option>
        <option v-for="option in options" :key="option[optionValueKey]" :value="option[optionValueKey]">{{option[optionTextKey]}}</option>
      </select>
      <slot name="error-message">
        <span v-show="errors.length" :class="errorClass">{{ errors[0] }}</span>
      </slot>
      <slot name="actions"></slot>
    </ValidationProvider>

  </div>
</template>

<script>
import { ValidationProvider } from 'vee-validate';

export default {
  name: 'VSwTextInput',
  components: {
    ValidationProvider
  },
  props: {
    value: { // Provided by Vue through v-model attribute
      type: String,
      default: ''
    },
    rules: {
      type: [String, Object],
      default: ''
    },
    options: {
      type: Array,
      required:true
    },
    optionValueKey: {
      type: String,
      required: false,
      default: 'ID'
    },
    optionTextKey: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: undefined
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false
    },
    errorClass: {
      type: String,
      required: false,
      default: 'ferror'
    },
    defaultText: {
      type: String,
      required: false
    }
  },
  methods: {
    handleChange(event) {
      console.log("Change event: " + event)
      this.$emit("change", event.target.value);
    },

    handleInput(event) {
      let fc = event.target.value
      console.log("Inout Event v select input to " + fc)
      this.$emit("input", event.target.value);
    }
  }
};
</script>
