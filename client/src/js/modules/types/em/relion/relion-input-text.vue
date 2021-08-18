<template>
  <base-input-text
    v-model="value"
    :name="name"
    :disabled="disabled"
    :label="label"
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
  </base-input-text>
</template>

<script>
import BaseInputText from 'app/components/base-input-text.vue'
import RelionInputMixin from 'modules/types/em/relion/relion-input-mixin'

export default {
    'name': 'RelionInputText',
    'components': {
        'base-input-text': BaseInputText,
    },
    'mixins': [RelionInputMixin],
}
</script>
