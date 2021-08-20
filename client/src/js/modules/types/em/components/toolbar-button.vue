<template>
  <span>
    <flat-button
      :level="level"
      :hint="hint"
      :disabled="disabled"
      @click="click"
      @mouseover="$emit('mouseover')"
      @mouseleave="$emit('mouseleave')"
    >
      <i :class="icon" />
      <b v-if="buttonLabel != ''">{{ buttonLabel }}</b>
      <span :style="textStyle">{{ buttonText }}</span>
    </flat-button>
    <slot />
  </span>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'ToolbarButton',
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'href': {
            'type': String,
            'default': '',
        },
        'icon': {
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
        'showText': {
            'type': Boolean,
            'default': false,
        },
        'hint': {
            'type': String,
            'default': '',
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
    'computed': {
        'textStyle': function() {
            return this.showText ? '' : 'display: none;'
        }
    },
    'methods': {
        'click': function() {
            if (this.href) {
                window.location = this.href
            } else {
                this.$emit('click')
            }
        }
    }
}
</script>
