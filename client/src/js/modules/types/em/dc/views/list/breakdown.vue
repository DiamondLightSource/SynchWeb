<template>
  <marionette-wrapper
    class="breakdown"
    :options="marionetteOptions"
    :mview="breakdownView"
  />
</template>

<script>
import BreakdownView from 'modules/stats/views/breakdown'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'

export default {
    'name': 'Breakdown',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
    },
    'props': {
        'model': {
            'type': Object,
            'required': true,
        },
    },
    'data': function() {
        return {
            'breakdownView': BreakdownView,
        }
    },
    'computed': {
        'marionetteOptions': function() {
            return {
                'model': this.model,
                'scatters': true,
                'hideOverview': true,
            }
        },
    },
}
</script>
