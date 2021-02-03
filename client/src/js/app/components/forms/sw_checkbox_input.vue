<!-- https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/ -->
<template>
  <div>
    <input
      :id="id"
      :name="id"
      type="checkbox"
      :value="value"
      @input="handleInput"
      v-bind="$attrs"
      v-on="getListeners"
    >
    <label class="secondary" :for="id">{{label}}
      <span v-if="description" class="small">{{description}}</span>
      <slot name="description"></slot>
    </label>
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "SwCheckboxInput",
  inheritAttrs: false,
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
    },
    id: {
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
    getListeners() {
      const { input, ...others } = this.$listeners;
      return { ...others };
    }
  },
  methods: {
    handleInput(event) {
      console.log("Checkbox control Input event: " + event.target.checked)
      this.$emit("input", event.target.checked);
    },
    // Don't think we need to handle change event - if so add @change=handleChange above
    // handleChange(event) {
    //   console.log("Checkbox control change event: " + event.target.checked)
    //   this.$emit("change", event.target.checked);
    // }
  }
};
</script>

