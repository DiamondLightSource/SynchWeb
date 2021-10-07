<template>
  <input-base
    :form="form"
    :name="name"
    :help-text="helpText"
    :extra-class="extraClass"
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
import inputValue from 'modules/types/em/components/input-value'

export default {
    'name': 'InputSelect',
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
        'selectOptions': function() {
            const schema = this.form.schema[this.name]
            const displayOptions = schema.displayOptions
            const simpleOptions = typeof displayOptions == 'undefined'
            const options = schema.options
            if (typeof options == 'undefined') {
                throw 'INPUT-SELECT - Schema for ' +
                    this.name + ' has no options field'
            }
            return options.map(function(option, index) {
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
