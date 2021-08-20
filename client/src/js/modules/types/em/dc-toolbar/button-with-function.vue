<template>
  <flat-button
    :level="level"
    :title="hint"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <i :class="iconClass" />
    <b v-if="buttonLabel != ''">{{ buttonLabel }}</b>
    <span style="display: none;">{{ buttonText }}</span>
  </flat-button>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'ButtonWithFunction',
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'iconClass': {
            'type': String,
            'required': true,
        },
        'buttonLabel': {
            'type': String,
            'default': '',
        },
        'buttonText': {
            'type': String,
            'required': true,
        },
        'hint': {
            'type': String,
            'required': true,
        },
        'disabled': {
            'type': Boolean,
            'default': false,
        },
        'level': {
            'type': String,
            'default': 'secondary',
        },
    },
}
</script>
