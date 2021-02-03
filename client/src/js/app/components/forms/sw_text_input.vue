<!-- https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/ -->
<template>
  <div>
    <label :for="id">{{label}}
      <span v-if="description" class="small">{{description}}</span>
      <slot name="description"></slot>
    </label>
    <input
      :id="id"
      :name="id"
      :type="type ? type : 'text'"
      :value="value"
      @input="handleInput"
      v-bind="$attrs"
      v-on="getListeners"
    >
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "SwTextInput",
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
    type: { // Allows a user to override the type so it could be password, number etc.
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
      this.$emit("input", event.target.value);
    }
  }
};
</script>

