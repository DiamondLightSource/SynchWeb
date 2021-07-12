<template>
  <marionette-wrapper
    :options="marionetteOptions"
    :mview="stackView"
  />
</template>

<script>
import StackView from 'modules/stats/views/stack'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'

export default {
    'name': 'Usage',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
    },
    'props': {
        'visit': {
            'type': String,
            'required': true,
        },
    },
    'data': function () {
        return {
            'marionetteOptions': { 'visit': this.visit },
            'stackView': StackView,
        }
    },
}
</script>
