<template>
  <span @mouseleave="$emit('mouseleave')">
    <flat-button
      :level="level"
      :hint="hint"
      :disabled="disabled"
      @click="click"
      @mouseover="$emit('mouseover')"
    >
      <i :class="icon" />
      <b v-if="buttonLabel != ''">{{ buttonLabel }}</b>
      <span :style="textStyle">{{ buttonText }}</span>
      <slot />
    </flat-button>
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
                this.$router.push(this.href)
            } else {
                this.$emit('click')
            }
        }
    }
}
</script>

<style>
.marionette-wrapper {
    color: #000;
}
</style>
