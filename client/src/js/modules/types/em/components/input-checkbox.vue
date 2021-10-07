<template>
  <input-base
    :form="form"
    :name="name"
    :help-text="helpText"
    :extra-class="extraClass"
  >
    <template #before>
      <input
        :id="id"
        v-model="value"
        :name="name"
        type="checkbox"
      >
    </template>
  </input-base>
</template>

<script>
import InputBase from 'modules/types/em/components/input-base.vue'
import inputValue from 'modules/types/em/components/input-value'

export default {
    'name': 'InputCheckbox',
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
    },
    'computed': {
        'id': function() {
            return this.name + '-ck'
        },
    },
}
</script>
