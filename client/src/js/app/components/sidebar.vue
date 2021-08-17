<template>
    <!--
        Separated side bar menu navigation into a separate component.
        Easier to deal with the separate styles required
    -->
    <div v-show="isLoggedIn && showMenu">
        <!-- Note added a high z index to ensure its displayed on top -->
        <div class="tw-absolute tw-flex tw-flex-col tw-z-10" @click="showMenu = false">
            <router-link to="/proposals"
                class="tw-py-3 tw-bg-sidebar-mobile-background hover:tw-bg-gray-200 tw-border-t tw-border-gray-400 tw-text-white tw-text-left tw-text-xs tw-px-2 ">
                Proposals
            </router-link>

            <router-link to="#" class="tw-relative tw-py-3 tw-bg-sidebar-mobile-background hover:tw-bg-gray-100 tw-border-t tw-border-gray-400 tw-text-white tw-text-left tw-text-xs tw-px-2">
                <p class=""><i v-show="isProposalClosed" class="fa fa-warning tw-text-red-500">&nbsp;</i>{{proposal ? proposal : 'No Proposal'}} <i v-show="proposal" class="fa fa-chevron-down"/></p>
            </router-link>

            <div>
                <router-link v-show="isProposalClosed" to="" class="tw-w-full tw-border-t tw-border-gray-400 tw-bg-sidebar-mobile-background hover:tw-bg-gray-100 tw-block tw-text-white tw-py-3 tw-px-4"><p>This proposal is closed.</p><p>You cannot create shipments, proteins or contacts.</p></router-link>
                <router-link v-for="(item, index) in proposalMenu" :key="index" :to="item.link | link"
                    class="tw-w-full tw-border-t tw-border-gray-400 tw-bg-sidebar-mobile-background hover:tw-bg-gray-100 tw-block tw-text-white tw-py-3 tw-px-4">
                    {{item.name}}
                </router-link>
            </div>

            <router-link v-for="(item, index) in extras" :key="index" :to="item.link | link" class="tw-py-3 tw-bg-sidebar-mobile-background hover:tw-bg-gray-100 tw-border-t tw-border-gray-400 tw-text-white tw-text-left tw-text-xs tw-px-2">
                {{item.name}}
            </router-link>

            <router-link to="/feedback" class="tw-py-3 tw-bg-sidebar-mobile-background hover:tw-bg-gray-100 tw-border-t tw-border-gray-400 tw-text-white tw-text-left tw-text-xs tw-px-2">
                Feedback
            </router-link>

            <router-link to="#" class="tw-relative tw-py-3 tw-bg-sidebar-mobile-background hover:tw-bg-gray-100 tw-border-t tw-border-gray-400 tw-text-white tw-text-left tw-text-xs tw-px-2">
                Help
            </router-link>

            <router-link to="/docs"
                class="tw-w-full tw-border-t tw-border-gray-400 tw-bg-sidebar-mobile-background hover:tw-bg-gray-100 tw-block tw-text-white tw-py-3 tw-px-4">
                Tutorial
            </router-link>
        </div>
        <!--
            Clickaway trick - element to catch events.
            Should be able to do this with a global directive but this actually works!
        -->
        <div class="clickaway" v-if="showMenu" @click="showMenu = false"></div>
    </div>
</template>

<script>
import EventBus from './utils/event-bus.js'

export default {
    name: 'Sidebar',
    props: {
        'proposalMenu': Array,
        'extrasMenu': Array,
    },

    data: function() {
        return {
            showMenu: false,
        }
    },

    mounted: function() {
        let self = this
        EventBus.$on('toggleSidebar', function () {
            self.showMenu = ! self.showMenu
        })
    },

    computed: {
        proposal: function() {
            return this.$store.getters['proposal/currentProposal']
        },
        isProposalClosed: function() {
            return this.$store.getters['proposal/currentProposalState'] == 'Closed'
        },
        isLoggedIn: function() {
            return this.$store.getters['auth/isLoggedIn']
        },
        // Only render extra menu if we have a valid proposal
        extras: function() {
            return this.proposal ? this.extrasMenu : []
        },
    },

    filters: {
        link: function(url) {
            // Make sure all menu options are absolute paths
            return (url[0] !== '/') ? '/' + url : url
        }
    },
}
</script>

<!-- Trick to catch click away from side bar menu -->
<style scoped>
.clickaway {
  @apply tw-w-screen;
  @apply tw-h-screen;
  @apply tw-fixed;
  @apply tw-top-0;
  @apply tw-left-0;
}
</style>