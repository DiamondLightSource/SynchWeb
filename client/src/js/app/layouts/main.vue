<template>
  <div class="tw-bg-content-background">
    <!-- Notifications appear at top of viewable screen space -->
    <notification-dialog/>
    <!-- Header menus and breadcrumbs (full width) -->
    <header-menu :staff_menus="adminMenu"/>
    <!-- Mobile search panel in same place as original -->
    <search-mobile />
    <breadcrumbs-panel :bc="bc"/>

    <!-- Popout menu for mobile screens -->
    <div class="tw-mx-auto">
        <sidebar-menu :proposalMenu="proposalMenu" :extrasMenu="extraMenu"/>
    </div>

    <!--
      Main panel to store proposal menu, messages and content
      Sets the main width of the content area on screen
    -->
    <div class="tw-w-10/12 tw-mx-auto">
        <navbar-menu :proposalMenu="proposalMenu" :extrasMenu="extraMenu"/>
        <motd-display :message="motd"/>
        <notification-persist-panel></notification-persist-panel>
        <div v-if="isLoading" ><div class="loading">&nbsp;</div></div>

        <!-- Main content section -->
        <div id="content-wrapper" class="tw-w-full tw-mx-2">
          <!-- Using the full route as key forces refresh when sharing the same component -->
          <router-view :key="$route.fullPath"></router-view>
        </div>
    </div>

    <!--
      Wrapping dialog box region in a component. In future we can redesign this
      For now it just registers the region and works with existing marionette views
    -->
    <dialog-box></dialog-box>

    <!-- Show logos, links etc. -->
    <footer-panel />
  </div>
</template>


<script>
import Header from 'app/components/header.vue'
import Footer from 'app/components/footer.vue'
import Sidebar from 'app/components/sidebar.vue'
import Navbar from 'app/components/navbar.vue'
import Breadcrumbs from 'app/components/breadcrumbs.vue'
import Motd from 'app/components/motd.vue'
import Notification from 'app/components/notification.vue'
import NotificationPersist from 'app/components/notification-persist.vue'
import EventBus from 'app/components/utils/event-bus.js'
import Dialog from 'app/components/dialogbox.vue'
import SearchMobile from 'app/components/search-mobile.vue'

import { mapState } from 'vuex'

export default {
    name: 'MainLayout',
    components: {
        'header-menu': Header,
        'footer-panel': Footer,
        'navbar-menu': Navbar,
        'sidebar-menu': Sidebar,
        'motd-display': Motd,
        'notification-dialog': Notification,
        'notification-persist-panel': NotificationPersist,
        'breadcrumbs-panel': Breadcrumbs,
        'dialog-box': Dialog,
        'search-mobile': SearchMobile
    },
    data: function() {
      return {
        admin_menu: [],
        proposal_menu: [],
        bc: [{title: 'Home', link: '/'}],
      }
    },
    computed: {
      proposalMenu: function() {
        // Old menu object has key:val as route-link:name
        return this.getMenuType('menu')
      },
      extraMenu: function() {
        // Old menu object has key:val as route-link:name
        return this.getMenuType('extra')
      },
      adminMenu: function() {
        // Old menu object has key:val as route-link:name
        return this.getMenuType('admin')
      },
      // Combine with local computed properties, spread operator
      // Allows us to use this.proposal and this.isLoading mapped to vuex state
      ...mapState(['isLoading', 'motd'])
    },
    created: function () {
      console.log(this.$options.name + " created")
      let self = this

      EventBus.$on('proposalChange', function (payLoad) {
          console.log("App Proposal has Changed - " + payload)
      })

      EventBus.$on('bcChange', function (payload=undefined) {
          self.bc = payload || []
      })
    },
    methods: {
      getMenuType: function(menuType) {
        var menu = []
        // On logout we seem to lose the getMenus getter...?
        var legacyMenu = this.$store.getters['menu/getMenu'](menuType) || null

        // If nothing found return an empty menu
        if (legacyMenu === null) { console.log(this.$options.name + " Warning menu not found (" + menuType + ")"); return menu }

        // Structure is different for admin menus
        if (menuType === 'admin') {
          Object.keys(legacyMenu).forEach(function(key) {
            var title = legacyMenu[key]['title']
            var icon = legacyMenu[key]['icon']
            var permission = legacyMenu[key]['permission'] ? legacyMenu[key]['permission'] : ''

            var item = {link: key, name: title, icon: icon, permission: permission}

            menu.push(item)
          })
        } else {
          // proposal and extra menus are simpler
          Object.keys(legacyMenu).forEach(function(key) {
            var item = {link: key, name: legacyMenu[key]}
            menu.push(item)
          })
        }

        return menu
      },
    },
}
</script>

