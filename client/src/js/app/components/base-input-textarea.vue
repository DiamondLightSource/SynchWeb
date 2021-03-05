<!--
Uses common pattern from SynchWeb with slots for defaults so you can override them
Slots include:
- description = sub title for the label
- error-msg = place to show error messages
- actions = place to show action buttons
-->
<template>
  <div :class="outerClass">
    <!-- The label which includes an optional subtitle -->
    <label v-if="label" :for="id">{{label}}
      <slot name="description">
        <span v-if="description" class="small">{{description}}</span>
      </slot>
    </label>

    <!-- The form input itself - bound to the v-model passed in -->
    <textarea
      v-show="editable"
      ref="inputRef"
      :id="id"
      :name="id"
      :maxLength="maxLength"
      :value="value"
      :class="classObject"
      @keyup="onEnter"
      @input="updateValue"
      @blur="onBlur"
      @focus="$emit('focus')"
    ></textarea>

    <span v-if="inline && !editable" class="btn-edit" @click="onEdit">{{ value }} <span><i :class="['fa', 'fa-edit']"></i> Edit</span></span>
    <button v-if="inline && editable" @mousedown="onSave" class="button">OK</button>

    <!-- Placeholder for any error message placed after the input -->
    <slot name="error-msg">
      <span v-show="errorMessage && !quiet" :class="errorClass">{{ errorMessage }}</span>
    </slot>

    <!-- Placeholder for any buttons that should be placed after the input -->
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "BaseInputTextArea",
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
    disabled: {
      type: Boolean,
      default: false
    },
    // Pass in class styling for input
    inputClass: {
      type: String,
    },
    errorClass: {
      type: String,
      required: false,
      default: 'ferror'
    },
    errorMessage: {
      type: String,
    },
    outerClass: {
      type: String,
    },
    // Default behaviour is to act as normal input
    inline: {
      type: Boolean,
      default: false
    },
    // If using the input within a table, set quiet mode to suppress error messages
    // Keeps the styling around input fields but does not show the error text
    quiet: {
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
    }
  }
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
/*
Main CSS stylesheets are heavily dependent on html structure
Defining styles here means they work in whatever structure we need
*/
input.ferror {
  @apply tw-bg-content-inactive;
}
</style>