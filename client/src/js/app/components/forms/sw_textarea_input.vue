<!-- https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/ -->
<template>
  <div>
    <label v-if="label" :for="id">{{label}}
      <span v-if="description" class="small">{{description}}</span>
      <slot name="description"></slot>
    </label>
    <textarea
      :id="id"
      :name="id"
      :maxLength="maxLength"
      :value="value"
      :class="classObject"
      @input="handleInput"
      v-bind="$attrs"
      v-on="getListeners"
    ></textarea>
    <slot name="error-msg">
      <span v-if="validate" :class="classObject">Error with form input</span>
    </slot>
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "SwTextAreaInput",
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
    maxLength: {
      type: Number,
      required: false
    },
    validate: {
      type: Boolean,
      required: false,
      default: false
    },
    errorClass: {
      type: String,
      required: false,
      default: 'ferror'
    }
  },
  computed: {
    getListeners() {
      const { input, ...others } = this.$listeners;
      return { ...others };
    },
    classObject() {
      return this.validate ? this.errorClass : ''
    }
  },
  methods: {
    handleInput(event) {
      this.$emit("input", event.target.value);
    }
  }
};
</script>

