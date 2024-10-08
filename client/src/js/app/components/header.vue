<template>
  <div
    id="vue-header"
    class="tw-flex tw-justify-between tw-items-center tw-h-10 tw-bg-header-background"
  >
    <div class="">
      <router-link
        class="tw-mx-1 tw-inline lg:tw-hidden hover:tw-text-header-hover-color"
        to=""
        @click.native="showSidebar"
      >
        <span class="fa fa-2x fa-bars" />
      </router-link>
      <router-link
        class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color"
        to="/"
      >
        <span class="fa fa-2x fa-home" /><p class="tw-hidden lg:tw-inline">
          Home
        </p>
      </router-link>
      <router-link
        v-if="isLoggedIn"
        class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color"
        to="/cal"
      >
        <span class="fa fa-2x fa-calendar" /><p class="tw-hidden lg:tw-inline">
          Calendar
        </p>
      </router-link>
      <router-link
        v-if="isLoggedIn"
        class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color"
        to="/"
        @click.native="logout"
      >
        <span class="fa fa-2x fa-sign-out" /><p class="tw-hidden lg:tw-inline">
          Logout
        </p>
      </router-link>
      <router-link
        v-else
        class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color"
        to="/login"
        @click.prevent="login"
      >
        <span class="fa fa-2x fa-sign-in" /> <p class="tw-hidden lg:tw-inline">
          Login
        </p>
      </router-link>
    </div>
    <div
      class="tw-flex"
    >
      <!-- Only show those links with correct permission -->
      <router-link
        v-for="(item, index) in validStaffMenus"
        :key="index"
        class="tw-mx-1 tw-text-header-color hover:tw-text-header-hover-color"
        :to="item.link | link"
        :alt="item.name"
      >
        <div class="tw-flex tw-flex-row tw-items-center">
          <i
            class="fa fa-2x"
            :class="item.icon"
          />
          <p class="tw-text-xs tw-mx-1 tw-hidden lg:tw-inline">
            {{ item.name }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import EventBus from './utils/event-bus.js'

export default {
    name: 'Header',
    filters: {
        link: function(url) {
            // Make sure all menu options are absolute paths
            return (url[0] !== '/') ? '/' + url : url
        }
    },
    props: {
      // Array of menu items: { name, link, icon, permission }
      'staff_menus' : Array
    },
    data: function() {
      return {
        showHelp: true,
        showHelpMenu: false
      }
    },
    computed: {
        isLoggedIn : function(){ return this.$store.getters['auth/isLoggedIn']},
        isStaff : function(){ return this.$store.getters['user/isStaff']},
        currentProposal : function(){ return this.$store.getters['proposal/currentProposal']},
        sso: function() {
          return this.$store.getters.sso;
        },
        validStaffMenus: function() {
          // filter the list of staff menus based on their permissions
          let menus = this.staff_menus.filter( item => {
            if (!item.permission) return item
            else return (this.$store.getters['user/hasPermission'](item.permission))
          }, this)
          return menus
        }
    },
    methods: {
      logout: function () {
        this.$store.dispatch('auth/logout')
        .then(() => {
          if (this.sso) {
            window.location.assign(`${this.$store.getters.apiUrl}/authenticate/logout`);
          } else {
            this.$router.push('/');
          }
        })
      },
      login: function() {
        this.$router.push('/login')
      },
      showSidebar: function() {
        EventBus.$emit('toggleSidebar')
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
