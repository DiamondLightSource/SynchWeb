<template>
  <div class="links">
    <a
      class="button"
      :href="statsUrl"
      title="Visit Statistics"
    >
      <i class="fa fa-pie-chart" /> <span>Visit Stats</span>
    </a>

    <a
      href="#"
      class="button users"
      @mouseover.prevent="showUsers = true"
      @mouseleave="showUsers = false"
    >
      <i class="fa fa-users" /> <span>Users</span>
      <marionette-wrapper
        v-if="showUsers"
        :options="marionetteOptions"
        :mview="userView"
      />
    </a>

    <a
      href="#"
      class="button dewars"
      @mouseover.prevent="showDewars = true"
      @mouseleave="showDewars = false"
    >
      <i class="fa fa-truck" /> <span>Parcels</span>
      <marionette-wrapper
        v-if="showDewars"
        :options="marionetteOptions"
        :mview="dewarsView"
      />
    </a>

    <!-- <a class="button"  href="/em/process/visit/<%-VISIT%>" title="Scipion Processing"><i class="fa fa-cog"></i> <span>Processing</span></a> -->

    <a
      class="button"
      :href="relionUrl"
      title="Relion Processing"
    >
      <i class="fa fa-cog" /> <span>Relion Processing</span>
    </a>
  </div>
</template>

<script>

import UserView from 'modules/proposal/views/users'
import DewarsView from 'modules/proposal/views/dewars'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'

export default {
    'name': "Toolbar",
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
            'userView': UserView,
            'showUsers': false,
            'dewarsView': DewarsView,
            'showDewars': false,
        }
    },
    'computed' : {
        'statsUrl': function() {
            console.log(this.userView)
            return '/stats/visit/' + this.visit
        },
        'relionUrl': function() {
            return '/em/process/relion/session/' +  this.visit
        },
    },
}
</script>

<style>
.marionette-wrapper, .marionette-wrapper div {
    display: inline;
}
</style>
