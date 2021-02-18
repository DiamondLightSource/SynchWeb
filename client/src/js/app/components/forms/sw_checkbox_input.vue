<!--
https://jschof.com/vue/a-form-component-in-vue-js-making-nice-wrappers/
https://medium.com/@logaretm/authoring-validatable-custom-vue-input-components-1583fcc68314
-->
<template>
  <div>
    <input
      v-show="editable"
      ref="inputRef"
      :id="id"
      :name="name"
      type="checkbox"
      :value="value"
      @input="updateValue"
      @blur="onBlur"
      @focus="$emit('focus')"
    >
    <span v-if="inline && !editable">{{ value }} <span @click="onEdit" class="btn-edit"><i :class="['fa', 'fa-edit']"></i> Edit</span></span>

    <label class="secondary" :for="id">{{label}}
      <slot name="description">
        <span v-show="description" class="small">{{description}}</span>
      </slot>
    </label>

    <button v-if="inline && editable" @mousedown="onSave" class="button">OK</button>

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
    // Default behaviour is to act as normal input
    // Set inline to enable edit/save behaviour
    inline: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editable: true
    }
  },

  computed: {
    // If a user passes in an error Message, add the error class to the input
    classObject() {
      return [ this.inputClass,  this.errorMessage ? this.errorClass : '']
    }
  },
  created() {
    // If created with editable = false then we are in inline-edit mode
    this.editable = !this.inline
  },
  methods: {
    updateValue(event) {
      // If we are in inline editing mode, only update model on save
      // If not them update value via input event
      if (!this.inline) this.$emit("input", event.target.value);
    },
    onBlur() {
      // If in inline edit mode cancel edit
      if (this.inline) this.editable = false
      this.$emit("blur")
    },
    onEdit() {
      // May add focus code here
      this.$refs.inputRef.focus()
      this.editable = true
    },
    onSave() {
      this.editable = false
      // In this case we are in inline edit mode so need to explicitly save the input value
      this.$emit("input", this.$refs.inputRef.value);
      // Also emit a save event so we can catch this change easily in the parent
      this.$emit("save", this.$refs.inputRef.value);
    },
    onEnter(event) {
      // If we are in inline edit mode - save the model on enter (key = 13)
      if (this.inline && event.keyCode == 13) this.onSave()
    },
  },
};
</script>

