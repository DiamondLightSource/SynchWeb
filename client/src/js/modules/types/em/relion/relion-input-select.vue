<template>
  <div class="relion-form-field">
    <label :for="id">
      {{ label }}
    </label>
    <div
      v-for="(description, index) in extraDescription"
      :key="index"
      class="relion-form-note"
    >
      {{ description }}
    </div>
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
  </div>
</template>

<script>
import relionInputMixin from 'modules/types/em/relion/relion-input-mixin'

export default {
    'name': 'RelionInputSelect',
    'mixins': [relionInputMixin],
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
