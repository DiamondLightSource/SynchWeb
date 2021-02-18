<!--
Time picker
This converts an input text input type into a time picker using jquery-plugin
Intended to abstract the logic from how the time picker part works so we can migrate to something else in future
Must have an id passed so we can associate the jquery-ui component to the control
-->
<template>
  <div>
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
    <span v-show="inline && !editable">{{ value }} <span @click="onEdit" class="btn-edit"><i :class="['fa', 'fa-edit']"></i> Edit</span></span>
    <button v-if="inline && editable" @mousedown="onSave" class="button">OK</button>

    <!-- Placeholder for any error message placed after the input -->
    <slot name="error-msg">
      <span v-show="errorMessage" :class="errorClass">{{ errorMessage }}</span>
    </slot>

    <!-- Placeholder for any buttons that should be placed after the input -->
    <slot name="actions"></slot>
  </div>
</template>

<script>
import 'jquery-ui.timepicker'

export default {
  name: "SwTimeInput",
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
      required: false
    },
    errorClass: {
      type: String,
      required: false,
      default: 'ferror'
    },
    errorMessage: {
      type: String,
      required: false
    },
    // Default behaviour is to act as normal input
    inline: {
      type: Boolean,
      required: false,
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
    var self = this
    $('#'+this.id).timepicker({
      onSelect: (timeText) => { if (!self.inline) self.$emit("input", timeText) },
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
}
</style>