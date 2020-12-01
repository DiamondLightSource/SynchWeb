<template>
    <div id="vue-login" class="content">
        <p class="tw-m-4 tw-p-4 tw-text-4xl tw-text-center tw-mx-auto tw-border-b tw-border-gray-500">SynchWeb Experiment Information Management</p>

        <h1>Login</h1>
        <p v-if="sso">Redirect to Single Sign On</p>
        <form class="tw-w-full md:tw-w-1/2 tw-mx-auto tw-px-8 tw-pt-6 tw-pb-8 tw-mb-4">
            <div class="tw-mb-4">
                <label class="tw-block tw-text-gray-700 tw-text-sm tw-font-bold tw-mb-2" for="login">Username (fedid)</label>
                <input class="tw-shadow tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline" v-model="username" type="text" name="login"/>
            </div>
            <div class="tw-mb-4">
                <label class="tw-block tw-text-gray-700 tw-text-sm tw-font-bold tw-mb-2" for="password">Password</label>
                <input class="tw-shadow tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline" v-model="password" type="password" name="password"/>
            </div>
            <button class="tw-bg-blue-500 hover:tw-bg-blue-700 tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded focus:tw-outline-none focus:tw-shadow-outline" v-on:click="onSubmit">Login</button>
        </form>
    </div>
</template>

<script>
import EventBus from 'app/components/utils/event-bus.js'

export default {
    name: 'Login',
    props: [
        'redirect' // For future if we need to handle cas authentication and multiple redirects
    ],
    data: function() {
        return {
            username: '',
            password: '',
            redirectUrl: '/current'
        }
    },
    
    computed: {
        sso: function() {
            return this.$store.getters.sso
        },
        sso_url: function() {
            return this.$store.getters.sso_url
        }
    },

    created: function() {
        // Update the breadcrumbs panel
        EventBus.$emit('bcChange', [{title: '/Login', url: '/login'}])
        // Check for single sign on
        this.singleSignOn()
    },

    methods: {
        singleSignOn: function() {
            // If we are using SSO we need to check auth and redirect if required
            // window.location.href='https://'+this.sso_url+'/cas/login?service='+encodeURIComponent(url)
            if (this.sso && location.href.indexOf('?ticket=') == -1) {
                let url = this.redirectUrl
                console.log("Login should be Redirecting to CAS: " + url)

                this.$store.dispatch('check_auth').then( (authenticated) => {
                    console.log("Check Auth OK: " + authenticated)
                    if (!authenticated) this.$router.replace(url)
                })
            }
        },
        onSubmit: function(event) {
            event.preventDefault()

            let credentials = { 'login': this.username, 'password': this.password }

            // Should probably move this into a combined login store method
            this.$store.dispatch('login', credentials)
            .then(() => {
                this.$store.dispatch('get_user').then(() => {
                    this.$router.push(this.redirectUrl)
                })
            })
            .catch( (err) => {
                // The error for invalid login is not particularly helpful - just a generic 400
                // When it becomes more helpful we could pass it to the notification
                console.log(err)
                this.$store.commit('add_notification', {title: 'Login Error', message: 'Please check you have correct username and password', level: 'error'})
            })

        },
        saveUrl: function(url) {
            // Save the URL we should redirect to after login
            if (url) {
                this.redirectUrl = url
            }
        }
    },
    beforeRouteEnter: function(to, from, next) {
        if (to.query.redirect) {
            console.log("Login::beforeRouteEnter - redirect to " + to.query.redirect)
            next(vm => {
                if (vm.sso) console.log("LOGIN KNOWS ITS SSO")
                else {
                    console.log("LOGIN DOES NOT KNOW YET")
                    vm.saveUrl(to.query.redirect)
                }
            })
        } else {
            console.log("Login::beforeRouteEnter - normal login")
            next()
        }
    },
}
</script>