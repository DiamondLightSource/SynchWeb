<template>
  <div class="relion-form-field">
    <label :for="id">
      {{ label }}
    </label>
    <div
      v-for="description in extraDescription"
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
        v-for="option in baseOptions"
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
        'baseOptions': function() {
            return this.parameters[this.name].options.map(function(option) {
                return typeof option == 'string' ?
                    { 'display': option, 'value': option } :
                    option
            })
        },
        'id': function() {
            return this.name + '-sel'
        },
    },
}
</script>
