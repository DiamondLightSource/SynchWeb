<template>
  <relion-input
    :schema="schema"
    :name="name"
    :help-text="helpText"
    :extra-class="extraClass"
    :error-messages="errorMessages"
  >
    <template #after>
      <select
        :id="id"
        v-model="value"
        :name="name"
        class="relion-form-input"
      >
        <option
          v-for="option in selectOptions"
          :key="option['value']"
          :value="option['value']"
        >
          {{ option['display'] }}
        </option>
      </select>
    </template>
  </relion-input>
</template>

<script>
import relionInputProperties from 'modules/types/em/relion/relion-input-properties'
import relionInputValue from 'modules/types/em/relion/relion-input-value'
import RelionInput from 'modules/types/em/relion/relion-input.vue'

export default {
    'name': 'RelionInputSelect',
    'components': {
        'relion-input': RelionInput,
    },
    'mixins': [
        relionInputProperties,
        relionInputValue,
    ],
    'computed': {
        'selectOptions': function() {
            const schema = this.schema[this.name]
            const displayOptions = schema.displayOptions
            const simpleOptions = typeof displayOptions == 'undefined'
            return schema.options.map(function(option, index) {
                return {
                    'display': simpleOptions ? option : displayOptions[index],
                    'value': option
                }
            })
        },
        'id': function() {
            return this.name + '-sel'
        },
    },
}
</script>
