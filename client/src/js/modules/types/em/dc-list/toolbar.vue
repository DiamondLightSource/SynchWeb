<template>
  <div class="links">
    <toolbar-button
      v-if="visit != ''"
      :href="statsUrl"
      :show-text="!isMobile"
      button-text="Visit Stats"
      hint="Visit Stats"
      icon="fa fa-pie-chart"
    />

    <toolbar-button
      v-if="visit != ''"
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


    <reprocess-button :show-text="!isMobile" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DewarsView from 'modules/proposal/views/dewars'
import MarionetteApplication from 'app/marionette-application'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'
import ReprocessButton from 'modules/types/em/components/reprocess-button.vue'
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'
import UserView from 'modules/proposal/views/users'

export default {
    'name': 'Toolbar',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
        'reprocess-button': ReprocessButton,
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
        ...mapGetters({
            'proposal': 'proposal/currentProposal',
            'visit': 'proposal/currentVisit',
        }),
        'isMobile': function() {
            return MarionetteApplication.getInstance().mobile()
        },
        'marionetteOptions': function() {
            return { 'visit': this.visit }
        },
        'statsUrl': function() {
            return '/stats/visit/' + this.visit
        },
        'relionUrl': function() {
            return '/em/process/relion/session/' + this.visit
        },
    },
}
</script>

<style>
.marionette-wrapper, .marionette-wrapper div {
    display: inline;
}
</style>
