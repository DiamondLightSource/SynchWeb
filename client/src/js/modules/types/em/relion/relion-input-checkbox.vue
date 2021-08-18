<template>
  <base-input-checkbox
    v-model="value"
    :name="name"
    :disabled="disabled"
    :label="label"
    input-class="relion-form-input"
    :outer-class="outerClass"
    :error-message="errorMessage"
  >
    <template #description>
      <div
        v-for="description in extraDescription"
        class="relion-form-note"
      >
        {{ description }}
      </div>
    </template>
  </base-input-checkbox>
</template>

<script>
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import RelionInputMixin from 'modules/types/em/relion/relion-input-mixin'

export default {
    'name': 'RelionInputCheckbox',
    'components': {
        'base-input-checkbox': BaseInputCheckbox,
    },
    'mixins': [RelionInputMixin],
    'props': {
        'outerClass': {
            'type': String,
            'default': 'relion-form-field',
        },
    },
}
</script>
