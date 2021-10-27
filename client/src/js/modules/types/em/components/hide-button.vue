<template>
  <flat-button
    level="primary"
    @click="click"
  >
    <i :class="hideIconClass" />
  </flat-button>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'HideButton',
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'value': {
            'type': Boolean,
            'default': false,
        },
    },
    'computed': {
        'hideIconClass': function() {
            return 'fa fa-' + (this.value ? 'chevron-down' : 'chevron-up')
        },
    },
    'methods': {
        'click': function() {
            this.$emit('input', !this.value)
        }
    }
}
</script>
