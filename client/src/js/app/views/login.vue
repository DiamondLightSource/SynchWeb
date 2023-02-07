<template>
    <div id="vue-login" class="content">
        <hero-title v-show="!skipHome"/>

        <h1>Login</h1>
        <p v-if="sso">Redirect to Single Sign On</p>

        <!-- Wrap the form in an observer component so we can check validation state on submission -->
        <validation-observer ref="observer" v-slot="{ invalid }">
            <form class="tw-w-full tw-mt-8">
                <ul>
                    <li class="tw-flex-col md:tw-flex-row tw-mb-4">
                        <label class="md:tw-w-5/12 tw-p-2 tw-text-left md:tw-text-right" for="username">Username (Fedid)</label>
                        <validation-provider rules="required|alpha_dash" v-slot="{ errors }" name="username">
                            <input
                                v-bind:class="[{ferror: errors.length}, 'tw-shadow tw-border tw-rounded tw-w-64 tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline']"
                                v-model="username"
                                type="text"
                                :name="name"
                                data-testid="username"/>
                            <p v-if="errors.length" class="tw-mt-2 md:tw-ml-2 tw-px-2 tw-border-l-2 tw-border-red-500 tw-text-red-800" data-testid="username-error">{{ errors[0] }}</p>
                        </validation-provider>
                    </li>
                    <li class="tw-flex-col md:tw-flex-row tw-mb-4">
                        <label class="md:tw-w-5/12 tw-p-2 tw-text-left md:tw-text-right" for="password">Password</label>
                        <validation-provider rules="required" v-slot="{ errors }" name="password">
                            <input
                                v-bind:class="[{ferror: errors.length}, 'tw-shadow tw-border tw-rounded tw-w-64 tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline']"
                                v-model="password"
                                type="password"
                                :name="name"
                                data-testid="password"/>
                            <p v-if="errors.length" class="tw-mt-2 md:tw-ml-2 tw-px-2 tw-border-l-2 tw-border-red-500 tw-text-red-800" data-testid="password-error">{{ errors[0] }}</p>
                        </validation-provider>
                    </li>
                    <li class="tw-flex-col md:tw-flex-row tw-mb-4">
                        <!-- Spacer to align login button neatly -->
                        <div class="md:tw-w-5/12 tw-px-2"></div>
                        <button :disabled="invalid" class="tw-px-8 tw-py-2 tw-w-64 tw-border tw-border-gray-400 button submit" v-on:click.prevent="onSubmit" data-testid="submit">Login</button>
                    </li>
                </ul>
            </form>
        </validation-observer>

    </div>
</template>

<script>
import Hero from 'app/components/herotitle.vue'
import EventBus from 'app/components/utils/event-bus.js'
import { ValidationProvider, ValidationObserver } from 'vee-validate'

export default {
    name: 'Login',
    components: {
        'hero-title': Hero,
        'validation-provider': ValidationProvider,
        'validation-observer': ValidationObserver,
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
        },
        skipHome: function() {
          return this.$store.state.skipHomePage
        }
    },

    created: function() {
        // Update the breadcrumbs panel
        EventBus.$emit('bcChange', [{title: '/Login', url: '/login'}])
        // Check for single sign on
        this.singleSignOn()
    },

    methods: {
        onSubmit: function(event) {
            event.preventDefault()

            this.$refs.observer.validate().then( (result) => {
              if (result) this.doLogin()
              else console.log("Form validation failed ")
            })
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
            if (this.sso && location.href.indexOf('?ticket=') === -1) {
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
            next(vm => {
                if (vm.sso) console.log("Login should be in sso mode")
                else {
                    console.log("Login save redirect url")
                    vm.saveUrl(to.query.redirect)
                }
            })
        } else {
            next()
        }
    },
}
</script>