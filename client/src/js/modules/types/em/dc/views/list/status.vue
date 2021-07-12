<template>
  <marionette-wrapper
    :options="marionetteOptions"
    :mview="statusView"
  />
</template>

<script>
import StatusView from 'views/status'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'

export default {
    'name': 'Status',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
    },
    'props': {
        'beamline': {
            'type': String,
            'required': true,
        },
    },
    'data': function () {
        return {
            'marionetteOptions': { 'bl': this.beamline },
            'statusView': StatusView,
        }
    },
}
</script>
