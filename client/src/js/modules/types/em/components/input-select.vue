<template>
  <input-base
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
        class="form-input"
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
  </input-base>
</template>

<script>
import InputBase from 'modules/types/em/components/input-base.vue'
import inputProperties from 'modules/types/em/components/input-properties'
import inputValue from 'modules/types/em/components/input-value'

export default {
    'name': 'RelionInputSelect',
    'components': {
        'input-base': InputBase,
    },
    'mixins': [
        inputProperties,
        inputValue,
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
