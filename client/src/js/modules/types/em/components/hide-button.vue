<template>
  <base-input-button @click="click">
    <i :class="hideIconClass" />
  </base-input-button>
</template>

<script>
import BaseInputButton from 'app/components/base-input-button.vue'

export default {
    'name': 'HideButton',
    'components': {
        'base-input-button': BaseInputButton,
    },
    'props': {
        'value': {
            'type': Boolean,
            'default': false,
        },
    },
    'computed': {
        'hideIconClass': function() {
            return 'fa fa-' + (this.value ? 'plus' : 'minus')
        },
    },
    'methods': {
        'click': function() {
            this.$emit('input', !this.value)
        }
    }
}
</script>
