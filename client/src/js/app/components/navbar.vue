<template>
    <!--
        Navigation bar which holds proposal menu, extras and feedback/help menu
        Was combined with mobile side bar menu but we have split it up so handle login and styles separately
    -->
    <div v-show="isLoggedIn" data-cy="navbar" class="tw-hidden tw-z-20 md:tw-flex md:flex-row tw-bg-sidebar-grad-end tw-justify-center tw-my-4 md:tw-mx-4">
        <!-- List proposals item -->
        <router-link to="/proposals" class="md:tw-w-48 tw-py-4 tw-bg-sidebar-grad-end hover:tw-bg-gray-100 tw-border tw-border-gray-400 tw-text-gray-900 tw-text-center tw-text-xs">
            Proposals
        </router-link>

        <!-- Proposal specific menu (Drop down) -->
        <router-link to="" class="tw-relative md:tw-w-48 tw-py-4 tw-bg-sidebar-grad-end hover:tw-bg-gray-100 tw-border tw-border-gray-400 tw-text-gray-900 tw-text-center tw-text-xs"
          @mouseover.native="showProposalMenu = true" @mouseleave.native="showProposalMenu=false" @click.native="showProposalMenu=false">
            <p class="tw-text-xs"><i v-show="isProposalClosed" class="fa fa-warning tw-text-red-500">&nbsp;</i> {{proposal ? proposal : 'No Proposal'}} <i v-show="proposal" class="fa fa-chevron-down"/></p>

            <div v-show="showProposalMenu && proposal">
                <div class="tw-absolute tw-left-0 tw-mt-4 tw-w-full tw-z-10">
                    <ul data-cy="navbar-proposal-menu" class="tw-border-t tw-border-l tw-border-r">
                        <li v-show="isProposalClosed" class="tw-w-full tw-border-b tw-border-l tw-border-r tw-border-gray-400 tw-bg-sidebar-grad-end">
                            <router-link to="" class="tw-block tw-text-gray-900 tw-py-3 tw-px-2"><p>This proposal is closed. You cannot create shipments, proteins or contacts.</p></router-link>
                        </li>
                        <li v-for="(item, index) in proposalMenu" :key="index" class="tw-w-full tw-border-b tw-border-l tw-border-r tw-border-gray-400 tw-bg-sidebar-grad-end hover:tw-bg-sidebar-hover-background">
                            <router-link  :to="item.link | link" class="tw-block tw-text-gray-900 tw-py-3 tw-px-2 tw-text-left">{{item.name}}</router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </router-link>

        <!-- Proposal extras menu items which sit within top level navbar-->
        <router-link v-for="(item, index) in extras" :key="index" :to="item.link | link" class="md:tw-w-48 tw-py-4 tw-bg-sidebar-grad-end hover:tw-bg-gray-100 tw-border tw-border-gray-400 tw-text-gray-900 tw-text-center tw-text-xs">
            {{item.name}}
        </router-link>

        <!-- Spacer element -->
        <div class="tw-flex-1 tw-py-4 tw-bg-sidebar-grad-end tw-border-t tw-border-b tw-border-gray-400">
            <p class="tw-text-gray-900 tw-text-center tw-text-xs"> </p>
        </div>

        <!-- Feedback -->
        <router-link to="/feedback" class="md:tw-w-48 tw-py-4 tw-bg-sidebar-grad-end hover:tw-bg-gray-100 tw-border tw-border-gray-400 tw-text-gray-900 tw-text-center tw-text-xs">
            Feedback
        </router-link>

        <!-- Help menu and tutorials -->
        <router-link to="" class="tw-relative md:tw-w-48 tw-py-4 tw-bg-sidebar-grad-end hover:tw-bg-gray-100 tw-border tw-border-gray-400 tw-text-gray-900 tw-text-center tw-text-xs"
          @mouseover.native="showHelpMenu = true" @mouseleave.native="showHelpMenu=false" @click.native="onToggleHelp">
            <p class="tw-text-xs">Help ({{helpStatus}})</p>

            <div v-show="showHelpMenu" >
                <div class="tw-absolute tw-left-0 tw-mt-4 tw-w-full">
                    <ul id="navbar-help-menu" class="tw-border-t tw-border-l tw-border-r">
                        <li class="tw-w-full tw-border-b tw-border-gray-400 tw-bg-sidebar-grad-end  hover:tw-bg-sidebar-hover-background">
                            <router-link  to="/docs" class="tw-block tw-py-4 tw-text-gray-900 ">Tutorials</router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </router-link>

    </div>

</template>

<script>
export default {
    name: 'Navbar',
    props: {
        'proposalMenu': Array,
        'extrasMenu': Array,
    },

    data: function() {
        return {
            // Display help text on a page
            showHelp: false,
            // If hover over help menu flag
            showHelpMenu: false,
            // If hover over proposal menu flag
            showProposalMenu: false,
        }
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
            if (this.proposal) return this.extrasMenu
        },
        helpStatus: function() {
            return this.showHelp ? "On" : "Off"
        }
    },

    filters: {
        link: function(url) {
            // Make sure all menu options are absolute paths for routing
            // They are defined in menu.js files and not always defined consistently
            if (url[0] !== '/') {
                return '/'+url
            } else {
                return url
            }
        },
    },
    methods: {
        onToggleHelp: function(event) {
            event.preventDefault()

            this.showHelp = !this.showHelp

            // Update Store - in future other pages might react
            this.$store.commit('setHelp', this.showHelp)

            if (this.showHelp) {
                // Old code set an active class on sidebar but it does not show up
                // $('#sidebar ul li.help').addClass('active')
                $('p.help').fadeIn()
            } else {
                // $('#sidebar ul li.help').removeClass('active')
                $('p.help').fadeOut()
            }
        },
    }
}
</script>