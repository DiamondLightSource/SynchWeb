<template>
  <div
    class="relion-form-field"
    :class="extraClasses"
  >
    <slot name="before" />
    <!-- eslint-disable vue/no-v-html -->
    <label
      :for="id"
      v-html="label"
    />
    <!-- eslint-enable vue/no-v-html -->
    <div
      v-for="(description, index) in extraDescription"
      :key="index"
      class="relion-form-note"
    >
      {{ description }}
    </div>
    <slot name="after" />
    <div class="relion-error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import relionInputProperties from 'modules/types/em/relion/relion-input-properties'

export default {
    'name': 'RelionInput',
    'mixins': [
        relionInputProperties
    ],
    'computed': {
        'id': function() {
            return this.name + '-txt'
        },
        'errorMessage': function() {
            const errorMessage = this.errorMessages[this.name]
            return errorMessage ? errorMessage : ''
        },
        'extraDescription': function() {
            const extraDescription = this.schema[this.name].extraDescription
            return typeof extraDescription == 'undefined' ?
                this.helpText : extraDescription.concat(this.helpText)
        },
        'extraClasses': function() {
            return (
                this.extraClass + ' ' + (
                    this.errorMessage ? 'relion-error' : ''
                )
            ).trim()
        },
        'label': function() {
            return this.schema[this.name].label
        }
    },
}
</script>
