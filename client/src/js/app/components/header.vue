<template>
    <div id="vue-header" class="tw-flex tw-justify-between tw-items-center tw-h-10 tw-bg-header-background">
      <div class="">
        <router-link class="tw-mx-1 tw-inline md:tw-hidden hover:tw-text-header-hover-color" @click.native="showSidebar" to=""><span class="fa fa-2x fa-bars"/></router-link>
        <router-link class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color" to="/"><span class="fa fa-2x fa-home"/><p class="tw-hidden md:tw-inline"> Home </p></router-link>
        <router-link class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color" v-if="isStaff" to="/cal"><span class="fa fa-2x fa-calendar"/><p class="tw-hidden md:tw-inline"> Calendar </p></router-link>
        <router-link class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color" v-if="isLoggedIn" to="/" v-on:click.native="logout"><span class="fa fa-2x fa-sign-out"/><p class="tw-hidden md:tw-inline"> Logout </p></router-link>
        <router-link class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color" v-else to="/login" @click.prevent="login"><span class="fa fa-2x fa-sign-in"/> <p class="tw-hidden md:tw-inline"> Login </p></router-link>
      </div>
      <div v-if="isLoggedIn && isStaff" class="tw-flex">
        <div v-if="isStaff" class="tw-flex">
          <!-- Extend this to selectively show those with correct permission -->
          <router-link v-for="(item, index) in staff_menus" 
            :key="index" 
            class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color" 
            :to="item.link | link"
            :alt="item.name">
            <div class="tw-flex tw-flex-row tw-items-center">
              <i class="fa fa-2x" v-bind:class="item.icon"/>
              <p class="tw-text-xs tw-mx-1 tw-hidden md:tw-inline">{{item.name}}</p>
            </div>
            </router-link>
        </div>
      </div>
    </div>
</template>

<script>
import EventBus from './utils/event-bus.js'

export default {
    name: 'Header',
    props: {
      'staff_menus' : Array
    },
    data: function() {
      return {
        showHelp: true,
        showHelpMenu: false
      }
    },
    computed: {
        isLoggedIn : function(){ return this.$store.getters.isLoggedIn},
        isStaff : function(){ return this.$store.getters.isStaff},
        currentProposal : function(){ return this.$store.getters.currentProposal},
        loginUrl: function() {
          return this.$store.sso ? this.$store.sso_url + '/cas/login?service=http://192.168.33.10:9000/current' : '/login'
        },
    },
    methods: {
      logout: function () {
        this.$store.dispatch('logout')
        .then(() => {
          if (this.$store.sso) this.$router.replace(this.$store.sso_url+'/cas/logout')
          else this.$router.push('/')
        })
      },
      login: function() {
        if (this.$router.sso) this.$router.replace(this.loginUrl)
        else this.$router.push('/login')
      },
      showSidebar: function() {
        EventBus.$emit('toggleSidebar')
      }
    },
    filters: {
        link: function(url) {
            // Make sure all menu options are absolute paths
            return (url[0] !== '/') ? '/' + url : url
        }
    },
}
</script>

<!-- 
  Header styles are only used within this component so css can be here.
  Example shows use of tailwind directives which can be chained together but show on separate lines for readability.
  Site logo can be customised by editing tailwind.config.js site-logo property.
-->
<style scoped>
/* Default style (for small screens has no logo) */
#vue-header {
  /* background-image: none; */
  @apply tw-bg-none;
}
/* The screen directive means any screen over medium size uses the following css */
@screen md {
  #vue-header {
    /* background-image: url('~images/site_logo_small.png');
    background-repeat: no-repeat;
    background-position: center; */
    @apply tw-bg-header-site-logo;
    @apply tw-bg-no-repeat;
    @apply tw-bg-center;
  }
}
</style>