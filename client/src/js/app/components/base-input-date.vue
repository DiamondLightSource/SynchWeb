<!--
Date Time picker
This converts an input text input type into a date picker using jquery-ui
Intended to abstract the logic from how the date picker part works so we can migrate to something else in future
Must have an id passed so we can associate the jquery-ui component to the control

Slots include:
- description = override sub title for the label
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
    <input
      v-show="editable"
      ref="inputRef"
      :id="id"
      :name="name"
      type="text"
      :value="value"
      :disabled="disabled"
      :class="classObject"
      @blur="onBlur"
      @focus="$emit('focus')"
    >
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
import 'jquery-ui/ui/widgets/datepicker'

export default {
  name: "BaseInputDate",
  props: {
    value: { // Passed in automatically if v-model used
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
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
    disabled: {
      type: Boolean,
      default: false
    },
    // Pass in class styling for input
    inputClass: {
      type: String,
    },
    outerClass: {
      type: String
    },
    errorClass: {
      type: String,
      required: false,
      default: 'ferror'
    },
    errorMessage: {
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
      editable: true,
      // Flag to tell us if dialog has been used
      // In inline mode we use this to cancel the change if user clicks away
      // They have to save by clicking OK to avoid surprising changes
      dialogOpened: false,
    }
  },
  computed: {
    // If a user passes in an error Message, add the error class to the input
    classObject() {
      return [ this.inputClass,  this.errorMessage ? this.errorClass : '']
    }
  },
  created: function() {
    // If created with inline then we are in inline-edit mode
    this.editable = !this.inline
  },
  mounted: function() {
    // Bind the date picker to the input control
    // In normal operation selecting a date updates the model
    // In inline-edit mode, only save when the OK button is clicked
    var self = this
    $('#'+this.id).datepicker({
      dateFormat: "dd-mm-yy",
      onSelect: (dateText) => { if (!self.inline) self.$emit("input", dateText) },
      onClose: () => { self.dialogOpened = true; self.$refs.inputRef.focus() }
    })
  },
  methods: {
    onBlur() {
      // If in inline edit mode cancel edit
      if (this.inline && this.dialogOpened) {
        this.editable = false
        this.dialogOpened = false
      }
      this.$emit("blur")
    },
    onEdit() {
      this.$refs.inputRef.focus()

      this.editable = true
    },
    onSave() {
      // In this case we are in inline edit mode so need to explicitly save the input value
      this.$emit("input", this.$refs.inputRef.value);
      this.$emit("save", this.$refs.inputRef.value);
      this.editable = false
    },
  }
};
</script>

<style scoped>
.btn-edit {
  cursor: pointer;
  @apply tw-rounded;
  @apply tw-inline-block;
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