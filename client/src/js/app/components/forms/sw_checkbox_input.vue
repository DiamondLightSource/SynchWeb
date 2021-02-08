<!--
https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/
https://medium.com/@logaretm/authoring-validatable-custom-vue-input-components-1583fcc68314
-->
<template>
  <div>
    <input
      :id="id"
      :name="name"
      type="checkbox"
      :value="value"
      @input="updateValue"
    >
    <label class="secondary" :for="id">{{label}}
      <slot name="description">
        <span v-show="description" class="small">{{description}}</span>
      </slot>
    </label>
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "SwCheckboxInput",
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
    },
    id: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false
    },
  },
  computed: {
    // If a user passes in an error Message, add the error class to the input
    classObject() {
      return [ this.inputClass,  this.errorMessage ? this.errorClass : '']
    }
  },
  methods: {
    updateValue(event) {
      this.$emit("input", event.target.checked);
    },
  }
};
</script>

