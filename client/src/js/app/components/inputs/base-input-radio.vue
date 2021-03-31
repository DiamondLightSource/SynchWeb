<!--
Array of radio buttons mapped to same value
Pass in an array of objects like so:
[
  {id: 1, label: 'Automated', value: 1},
  {id: 2, label: 'Responsive', value: 2}
]

Bind a model which will store the value of the selected option.
To reset the state of the radio buttons pass a value of '' to the v-model parameter
-->
<template>
  <div :class="outerClass">
    <div v-for="option in options" :key="option.id">
      <input
        v-model="selected"
        :id="option.id"
        :name="option.id"
        type="radio"
        :value="option.value"
        @change="updateValue"
      >
      <label v-show="option.label" class="secondary" :for="option.id">{{option.label}}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseInputRadio",
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true,
    },
    outerClass: {
      type: String,
    },
  },
  data: function() {
    return {
      // Local state used to store the radio status
      selected: this.value,
    }
  },
  watch: {
    // If someone has manually set the model to null or '' then we should update our radio state
    value: function(newVal) {
      if (newVal === '') this.selected = ''
    }
  },
  methods: {
    // Don't think we need to handle input event - if so add @input=handleInput above
    updateValue(event) {
      this.selected = event.target.value
      this.$emit("input", event.target.value);
    }
  }
};
</script>

