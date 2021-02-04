<!--
Date Time picker
This converts an input text input type into a date picker using jquery-ui
Intended to abstract the logic from how the date picker part works so we can migrate to something else in future
-->
<template>
  <div>
    <label v-if="label" :for="id">{{label}}
      <span v-if="description" class="small">{{description}}</span>
      <slot name="description"></slot>
    </label>
    <input
      :id="id"
      :name="name"
      type="text"
      :value="value"
      v-bind="$attrs"
      v-on="getListeners"
    >
    <slot name="actions"></slot>
  </div>
</template>

<script>
import 'jquery-ui/ui/widgets/datepicker'

export default {
  name: "SwDateInput",
  inheritAttrs: false,
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
    }
  },
  computed: {
    getListeners() {
      const { input, ...others } = this.$listeners;
      return { ...others };
    }
  },
  mounted: function() {
    var self = this
    $('#'+this.id).datepicker({
      dateFormat: "dd-mm-yy",
      onSelect: (dateText) => self.$emit("input", dateText)
    })
  }
};
</script>

