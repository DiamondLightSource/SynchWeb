<template>
    <div id="vue-login" class="content">
        <hero-title />

        <h1>Login</h1>
        <p v-if="sso">Redirect to Single Sign On</p>
        <form class="tw-w-full md:tw-w-1/2 tw-mx-auto tw-mt-8">
            <ul>
                <li class="tw-flex-col md:tw-flex-row tw-mb-4">
                    <label class="md:tw-w-1/3 tw-p-2 tw-text-left md:tw-text-right" for="username">Username (Fedid)</label>
                    <input v-bind:class="[{ferror: errors.has('username')}, 'tw-shadow tw-border tw-rounded tw-w-64 tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline']" v-validate="'required'"  v-model="username" type="text" name="username"/>
                    <div class="tw-content-center"><p v-if="errors.has('username')" class="tw-content-center tw-mt-2 md:tw-ml-2 tw-align-text-bottom tw-px-2 tw-border-l-2 tw-border-red-500 tw-text-red-800">{{ errors.first('username') }}</p></div>
                </li>
                <li class="tw-flex-col md:tw-flex-row tw-mb-4">
                    <label class="md:tw-w-1/3 tw-p-2 tw-text-left md:tw-text-right" for="password">Password</label>
                    <input v-bind:class="[{ferror: errors.has('password')}, 'tw-shadow tw-border tw-rounded tw-w-64 tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline']" v-validate="'required'" v-model="password" type="password" name="password"/>
                    <div class="tw-content-center"><p v-if="errors.has('password')" class="tw-mt-2 md:tw-ml-2 tw-px-2 tw-border-l-2 tw-border-red-500 tw-text-red-800">{{ errors.first('password') }}</p></div>
                </li>
                <li class="tw-flex-col md:tw-flex-row tw-mb-4">
                    <!-- Spacer to align login button neatly -->
                    <div class="md:tw-w-1/3 tw-px-2"></div>
                    <button class="tw-px-8 tw-py-2 tw-w-64 tw-border tw-border-gray-400 button submit" v-on:click.prevent="onSubmit">Login</button>
                </li>
            </ul>
        </form>
    </div>
</template>

<script>
import Hero from 'app/components/herotitle.vue'
import EventBus from 'app/components/utils/event-bus.js'

import Vue from 'vue'
import VeeValidate from 'veevalidate'
// Currently implemented with vee-validate
// May want to move to vuelidate as it would fit with backbone models easier
// Could reuse validation within backbone models then
Vue.use(VeeValidate)

export default {
    name: 'Login',
    components: {
        'hero-title': Hero,
    },
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
        // Using the method below is simple alternative that
        // allows us to clear form data after submission
        resetForm: function() {
            this.username = ''
            this.password = ''

            // To reset form validation, we should wait for next tick
            // Vue rectivity means the DOM will not be updated immediately
            this.$nextTick(function() {
                this.$validator.reset()
            })
        },

        onSubmit: function(event) {
            event.preventDefault()

            let self = this

            this.$validator.validateAll().then(function(result) {
                if (result) {
                    self.doLogin()
                } else {
                    console.log('Form submission prevented, validation failed');
                }
            });
        },

        doLogin: function() {
            let credentials = { 'login': this.username, 'password': this.password }


            // Should probably move this into a combined login store method
            this.$store.dispatch('auth/login', credentials)
            .then(() => {
                this.$store.dispatch('user/getUser').then(() => {
                    this.$router.push(this.redirectUrl)
                })
            })
            .catch( (err) => {
                // The error for invalid login is not particularly helpful - just a generic 400
                // When it becomes more helpful we could pass it to the notification
                console.log(err)
                this.$store.commit('notifications/addNotification', {title: 'Login Error', message: 'Please check you have correct username and password', level: 'error'})
            })

        },
        // Methods to support SSO - TODO
        singleSignOn: function() {
            // If we are using SSO we need to check auth and redirect if required
            // window.location.href='https://'+this.sso_url+'/cas/login?service='+encodeURIComponent(url)
            if (this.sso && location.href.indexOf('?ticket=') == -1) {
                let url = this.redirectUrl
                console.log("Login should be Redirecting to CAS: " + url)

                this.$store.dispatch('auth/checkAuth').then( (authenticated) => {
                    console.log("Check Auth OK: " + authenticated)
                    if (!authenticated) this.$router.replace(url)
                })
            }
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