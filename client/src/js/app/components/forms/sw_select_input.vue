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
    <label v-if="label" :for="id">{{label}}
      <span v-if="description" class="small">{{description}}</span>
      <slot name="description"></slot>
    </label>
    <select
      :id="id"
      :name="name"
      :value="value"
      @input="handleInput"
      v-bind="$attrs"
      v-on="getListeners">
      <option v-show="defaultText" disabled value="">{{defaultText}}</option>
      <option v-for="option in options" :key="option[optionValueKey]" :value="option[optionValueKey]">{{option[optionTextKey]}}</option>
    </select>
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "SwSelectInput",
  inheritAttrs: false,
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
    }
  },
  computed: {
    getListeners() {
      const { input, ...others } = this.$listeners;
      return { ...others };
    }
  },
  methods: {
    handleInput(event) {
      console.log("Input event: " + event)
      this.$emit("input", event.target.value);
    },
  }
};
</script>

