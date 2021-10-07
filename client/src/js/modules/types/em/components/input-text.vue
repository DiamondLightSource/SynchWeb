<template>
  <input-base
    :form="form"
    :name="name"
    :help-text="helpText"
    :extra-class="extraClass"
  >
    <template #after>
      <input
        :id="id"
        v-model="value"
        type="text"
        :name="name"
        :disabled="disabled"
        class="form-input"
      >
    </template>
  </input-base>
</template>

<script>
import InputBase from 'modules/types/em/components/input-base.vue'
import inputValue from 'modules/types/em/components/input-value'

export default {
    'name': 'InputText',
    'components': {
        'input-base': InputBase,
    },
    'mixins': [
        inputValue,
    ],
    'props': {
        'form': {
            'type': Object,
            'required': true,
        },
        'name': {
            'type': String,
            'required': true,
        },
        'helpText': {
            'type': Array,
            'default': function() { return [] },
        },
        'extraClass': {
            'type': String,
            'default': '',
        },
        'disabled': {
            'type': Boolean,
            'default': false,
        },
    },
    'computed': {
        'id': function() {
            return this.name + '-txt'
        },
    },
}
</script>
