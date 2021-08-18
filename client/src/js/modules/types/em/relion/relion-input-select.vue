<template>
  <base-input-select
    v-model="value"
    :name="name"
    :disabled="disabled"
    :label="label"
    :options="baseOptions"
    option-text-key="display"
    option-value-key="value"
    :default-text="defaultText"
    :error-message="errorMessage"
    input-class="relion-form-input"
    outer-class="relion-form-field"
  >
    <template #description>
      <div
        v-for="description in extraDescription"
        class="relion-form-note"
      >
        {{ description }}
      </div>
    </template>
  </base-input-select>
</template>

<script>
import BaseInputSelect from 'app/components/base-input-select.vue'
import RelionInputMixin from 'modules/types/em/relion/relion-input-mixin'

export default {
    'name': 'RelionInputSelect',
    'components': {
        'base-input-select': BaseInputSelect,
    },
    'mixins': [RelionInputMixin],
    'props': {
        'options': {
            'type': Array,
            'required': true,
        },
        'defaultText': {
            type: String,
            default: 'Please select',
        },
    },
    'computed': {
        'baseOptions': function() {
            return this.options.map(function(option) {
                return typeof option == 'string' ?
                    { 'display': option, 'value': option } :
                    option
            })
        }
    },
}
</script>
