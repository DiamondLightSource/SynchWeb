<!--
Base Checkbox
Includes optional label component
Can provide form component or inline (edit on hover) behaviour

Slots include:
- description = override sub title for the label placed after the input
- actions = place to show action buttons
- Checkboxes use checked attribute to set its state and listens for the change event; according to https://vuejs.org/v2/guide/forms.html
-->
<template>
  <div :class="outerClass">
    <input
      v-show="editable"
      ref="inputRef"
      :id="id"
      :name="name"
      type="checkbox"
      :checked="value"
      :disabled="disabled"
      @input="updateValue"
      @change="changeValue"
      @blur="onBlur"
      @focus="$emit('focus')"
    >
    <span v-if="inline && !editable" class="btn-edit" @click="onEdit" @mouseover="showEditIcon = true" @mouseleave="showEditIcon = false">{{ value }} <span v-show="showEditIcon"><i :class="['fa', 'fa-edit']"></i> Edit</span></span>

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
  name: "BaseInputCheckbox",
  props: {
    value: { // Passed in automatically if v-model used
      type: Boolean,
      required: true,
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
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // Default behaviour is to act as normal input
    // Set inline to enable edit/save behaviour
    inline: {
      type: Boolean,
      default: false,
    },
    // Class styling for outer div of this component
    outerClass: {
      type: String,
    }
  },
  data() {
    return {
      editable: true,
      showEditIcon: false,
    }
  },
  watch: {
    editable: function(value) {
      if (value == false) this.showEditIcon = false
    }
  },
  created() {
    // If created with editable = false then we are in inline-edit mode
    this.editable = !this.inline
  },
  methods: {
    updateValue(event) {
      // If we are in inline editing mode, only update model on save
      // If not then update value via input event
      if (!this.inline) this.$emit("input", event.target.checked);
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
      this.$emit("input", this.$refs.inputRef.checked);
      // Also emit a save event so we can catch this change easily in the parent
      this.$emit("save", this.$refs.inputRef.checked);
    },
    onEnter(event) {
      // If we are in inline edit mode - save the model on enter (key = 13)
      if (this.inline && event.keyCode == 13) this.onSave()
    },
  },
};
</script>

<style scoped>
.btn-edit {
  cursor: pointer;
  @apply tw-rounded;
}
.btn-edit:hover {
  @apply tw-bg-content-search-background;
}
</style>
