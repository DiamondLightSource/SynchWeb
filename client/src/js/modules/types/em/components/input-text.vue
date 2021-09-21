<template>
  <input-base
    :schema="schema"
    :name="name"
    :help-text="helpText"
    :extra-class="extraClass"
    :error-messages="errorMessages"
  >
    <template #after>
      <input
        :id="id"
        v-model="value"
        type="text"
        :name="name"
        class="form-input"
      >
    </template>
  </input-base>
</template>

<script>
import InputBase from 'modules/types/em/components/input-base.vue'
import inputProperties from 'modules/types/em/components/input-properties'
import inputValue from 'modules/types/em/components/input-value'

export default {
    'name': 'RelionInputText',
    'components': {
        'input-base': InputBase,
    },
    'mixins': [
        inputProperties,
        inputValue,
    ],
    'computed': {
        'id': function() {
            return this.name + '-txt'
        },
    },
}
</script>
