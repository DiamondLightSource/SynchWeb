<template>
  <div class="links">
    <toolbar-link
      :href="statsUrl"
      title="Visit Stats"
      icon="fa-pie-chart"
    />

    <toolbar-link
      extra-class="users"
      title="Users"
      icon="fa-users"
      @mouseover="showUsers = true"
      @mouseleave="showUsers = false"
    >
      <marionette-wrapper
        v-if="showUsers"
        :options="marionetteOptions"
        :mview="userView"
      />
    </toolbar-link>

    <toolbar-link
      title="Parcels"
      extra-class="dewars"
      icon="fa-truck"
      @mouseover="showDewars = true"
      @mouseleave="showDewars = false"
    >
      <marionette-wrapper
        v-if="showDewars"
        :options="marionetteOptions"
        :mview="dewarsView"
      />
    </toolbar-link>

    <!-- <a class="button"  href="/em/process/visit/<%-VISIT%>" title="Scipion Processing"><i class="fa fa-cog"></i> <span>Processing</span></a> -->

    <toolbar-link
      :href="relionUrl"
      title="Relion Processing"
      icon="fa-cog"
    />
  </div>
</template>

<script>
import UserView from 'modules/proposal/views/users'
import DewarsView from 'modules/proposal/views/dewars'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'
import ToolbarLink from 'modules/types/em/dc-list/toolbar-link.vue'

export default {
    'name': 'Toolbar',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
        'toolbar-link': ToolbarLink,
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
