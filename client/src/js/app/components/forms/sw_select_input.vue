<!-- https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/ -->
<template>
  <div>
    <label v-show="label" :for="id">{{label}}
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
      <option v-for="item in items" :key="item[itemKey]" :value="item[itemKey]">{{item[itemValue]}}</option>
    </select>
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "SwSelectInput",
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required:true
    },
    itemKey: {
      type: String,
      required: true
    },
    itemValue: {
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

