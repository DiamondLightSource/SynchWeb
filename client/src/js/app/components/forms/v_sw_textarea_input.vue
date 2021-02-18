<!-- VeeValidation Component -->
<template>
  <div>
    <label v-if="label" :for="id">{{label}}
      <span v-if="description" class="small">{{description}}</span>
      <slot name="description"></slot>
    </label>

    <ValidationProvider tag="div" :rules="rules" :name="name" :vid="id" v-slot="{ errors }">
      <textarea
        :name="name"
        :maxLength="maxLength"
        v-model="value"
        :class="[ errors.length ? errorClass : '']"
        @input="handleInput"></textarea>
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
  name: 'VSwTextAreaInput',
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
    maxLength: {
      type: Number,
      required: false
    },
    id: {
      type: String,
      default: undefined
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
