<template>
  <marionette-wrapper
    :options="marionetteOptions"
    :mview="logView"
  />
</template>

<script>
import DCLogView from 'modules/dc/views/dclog'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'

export default {
    'name': 'Log',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
    },
    'props': {
        'collection': {
            'type': Object,
            'required': true,
        },
    },
    'data': function () {
        return {
            'marionetteOptions': { 'collection': this.collection },
            'logView':DCLogView,
        }
    },
}
</script>
