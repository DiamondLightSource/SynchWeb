<template>
  <relion-input
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
        class="relion-form-input"
      >
    </template>
  </relion-input>
</template>

<script>
import relionInputProperties from 'modules/types/em/relion/relion-input-properties'
import relionInputValue from 'modules/types/em/relion/relion-input-value'
import RelionInput from 'modules/types/em/relion/relion-input.vue'

export default {
    'name': 'RelionInputText',
    'components': {
        'relion-input': RelionInput,
    },
    'mixins': [
        relionInputProperties,
        relionInputValue,
    ],
    'computed': {
        'id': function() {
            return this.name + '-txt'
        },
    },
}
</script>
