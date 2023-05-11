<template>
  <div class="usageStack">
    <marionette-wrapper
      :options="marionetteOptions"
      :mview="usageStackView"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'
import UsageStackView from 'modules/stats/views/stack'

export default {
    'name': 'UsageStack',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
    },
    'data': function () {
        return {
            'usageStackView': UsageStackView,
        }
    },
    'computed': {
        ...mapGetters({
            'visit': 'proposal/currentVisit',
        }),
        'marionetteOptions': function() {
            return { 'visit': this.visit }
        },
    },
}
</script>

<style scoped>
.usageStack {
    flex-grow: 1;
}
</style>
