<!-- VeeValidation Component -->
<template>
  <div>
    <label v-if="label" :for="id">{{label}}
      <slot name="description">
        <span v-if="description" class="small">{{description}}</span>
      </slot>
    </label>

    <ValidationProvider tag="div" :rules="rules" :name="name" :vid="id" v-slot="{ errors }">
      <input
        :id="id"
        :name="name"
        :type="type"
        v-model="value"
        :class="[ errors.length ? errorClass : '']"
        @input="handleInput">
      <slot name="error-message">
        <span v-show="errors.length" :class="errorClass">{{ errors[0] }}</span>
      </slot>
    </ValidationProvider>

    <slot name="actions"></slot>

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
    }
  },
  methods: {
    handleInput(event) {
      this.$emit("input", event.target.value);
    }
  }
};
</script>
