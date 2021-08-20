<template>
  <div class="links">
    <toolbar-button
      :href="statsUrl"
      :show-text="!isMobile"
      button-text="Visit Stats"
      hint="Visit Stats"
      icon="fa fa-pie-chart"
    />

    <toolbar-button
      :show-text="!isMobile"
      button-text="Users"
      icon="fa fa-users"
      @mouseover="showUsers = true"
      @mouseleave="showUsers = false"
    >
      <marionette-wrapper
        v-if="showUsers"
        :options="marionetteOptions"
        :mview="userView"
      />
    </toolbar-button>

    <toolbar-button
      :show-text="!isMobile"
      button-text="Parcels"
      icon="fa fa-truck"
      @mouseover="showDewars = true"
      @mouseleave="showDewars = false"
    >
      <marionette-wrapper
        v-if="showDewars"
        :options="marionetteOptions"
        :mview="dewarsView"
      />
    </toolbar-button>

    <!-- <a class="button"  href="/em/process/visit/<%-VISIT%>" title="Scipion Processing"><i class="fa fa-cog"></i> <span>Processing</span></a> -->

    <toolbar-button
      :show-text="!isMobile"
      :href="relionUrl"
      button-text="Relion Processing"
      hint="Relion Processing"
      icon="fa fa-cog"
    />
  </div>
</template>

<script>
import DewarsView from 'modules/proposal/views/dewars'
import MarionetteApplication from 'app/marionette-application'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'
import UserView from 'modules/proposal/views/users'

export default {
    'name': 'Toolbar',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
        'toolbar-button': ToolbarButton,
    },
    'data': function () {
        return {
            'userView': UserView,
            'showUsers': false,
            'dewarsView': DewarsView,
            'showDewars': false,
        }
    },
    'computed' : {
        'isMobile': function() {
            return MarionetteApplication.getInstance().mobile()
        },
        'marionetteOptions': function() {
            return { 'visit': this.$store.state.proposal.visit }
        },
        'statsUrl': function() {
            return '/stats/visit/' + this.$store.state.proposal.visit
        },
        'relionUrl': function() {
            return '/em/process/relion/session/' + this.$store.state.proposal.visit
        },
    },
}
</script>

<style>
.marionette-wrapper, .marionette-wrapper div {
    display: inline;
}
</style>
