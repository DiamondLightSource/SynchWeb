<!--
Pass in an array of objects like so:
[
  {id: 1, label: 'Automated', value: 1},
  {id: 2, label: 'Responsive', value: 2}
]

Bind a model which will store the value of the selected option.
To reset the state of the radio buttons pass a value of '' to the v-model parameter
Based on initial approach by https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/

</template>
-->
<template>
  <div>
    <div v-for="option in options" :key="option.id">
      <input
        v-model="selected"
        :id="option.id"
        :name="option.id"
        type="radio"
        :value="option.value"
        @change="handleChange"
        v-bind="$attrs"
        v-on="getListeners"
      >
      <label class="secondary" :for="option.id">{{option.label}}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: "SwRadioInput",
  inheritAttrs: false,
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true,
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
  computed: {
    getListeners() {
      const { input, ...others } = this.$listeners;
      return { ...others };
    }
  },
  methods: {
    // Don't think we need to handle input event - if so add @input=handleInput above
    handleChange(event) {
      this.selected = event.target.value
      this.$emit("input", event.target.value);
    }
  }
};
</script>

