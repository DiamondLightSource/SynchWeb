import Backbone from 'backbone'
import Marionette from 'backbone.marionette'
import config from 'config.json'


var MarionetteApplication = (function () {
    var instance;

    function createInstance() {
        console.log("Marionette::createInstance - Creating Singleton instance of Marionette Application")
        let application = new Marionette.Application()

        initialise(application)

        return application;
    }

    function initialise(application) {
        // Initialize Sync
        // let self = this
        // Allow us to set a global base url for the API
        var oldSync = Backbone.sync;

        Backbone.sync = function(method, model, options) {
          var url = _.isFunction(model.url) ? model.url() : model.url;

          options = options || {};
          if (url) {
              options.url = application.apiurl+url
          }

          return oldSync.call(this, method, model, options);
        }

        // Pass prop to Backbone.ajax
        var oldAjax = Backbone.ajax

        Backbone.ajax = function(options) {
            var prop = window.app.prop
            var token = window.app.token

            // Automatically add the proposal to each request if we have one
            if (prop !== '' ){
                // FormData
                if (options.data instanceof FormData) {
                    options.data.append('prop', prop)

                // JSON content
                } else if (options.contentType == 'application/json' || options.type == 'DELETE') {
                    if (options.data) var tmp = JSON.parse(options.data)
                    else var tmp = {}

                    if (Array.isArray(tmp)) tmp[0].prop = prop
                    else {
                        if (!tmp.prop) tmp.prop = prop
                    }
                    options.data = JSON.stringify(tmp)

                // Append to object for anything else
                } else {
                    if (!options.data) options.data = {}
                    if (!options.data.prop) options.data.prop = prop
                }
            }

            // Send token with requst
            if (token) {
                options.beforeSend = function(request){
                    request.setRequestHeader('Authorization', 'Bearer ' + token);
                }
            }

            return oldAjax.call(this, options)
        }

        // Handle ajax errors in a generic way
        $(document).ajaxError(_.debounce(function(event, xhr, settings, error) {
            console.log('ajax error', 'status', xhr.status, 'code', settings, error)

            var json;
            if (xhr.responseText) {
                try {
                    json = $.parseJSON(xhr.responseText)
                } catch(err) {

                }
            }
            var msg = json && (json.error || json.msg) ? (json.error ? json.error : json.msg) : error

            if (xhr.readyState == 0) {
                application.alert({ title: 'Network Error', message: 'A network request failed', persist: 'network' })

            }

            if (xhr.status == 401) {
                // Need to hook login into vue-router...
                application.login(xhr)
            }
            if (xhr.status == 500) {
                application.alert({ title: 'Internal Server Error', message: 'An application error has occurred <pre>'+msg+'</pre>', persist: 'e500' })
            }
            if (xhr.status == 503) {
                if (json) application.alert({ title: 'Service Unavailable', message: 'A database error has occurred <pre>'+msg+'</pre>', persist: 'e503' })
                else  application.alert({ title: 'Service Unavailable', message: 'A server error has occurred <pre>'+msg+'</pre>', persist: 'e503' })
            }
        }, 300))

        application.mobile = function() {
            return $(window).width() <= 600
        }

        /*
        Log message to console
        */
        application.log = function() {
            console.log.apply(console, arguments)
        },

        //
        // Define a couple of method to track mapping router and store methods to app functions
        //
        // Pass vue-router into this one
        application.initRouteMapping = function(router) {
            console.log("MARIONETTE SINGLETON initRouterMapping")
            // Override Marionette Navigation method - hook into Vue router
            application.navigate = function(url) {
                router.push(url)
            }
            // Allow the app to load a proposal on bootstrap
            // Used when users navigate via typing in an address directly
            application.parseQuery = function(path) {
                var str = path.replace(/\?/, '').split(/&/)
                var pairs = {}
                _.each(str, function(v) {
                    var kv = v.split(/=/)
                    pairs[kv[0]] = kv[1]
                })

                console.log('pairs', pairs)

                if ('prop' in pairs) {
                    return pairs.prop
                } else {
                    return null
                }
            }
        }
        // Pass vuex-store into this one
        application.initStateMapping = function(store) {
            console.log("MARIONETTE SINGLETON initStateMapping")
            // Map legacy app functions to store mutations and actions
            application.apiurl = store.state.apiUrl
            application.appurl = store.state.appUrl

            application.cookie = function(prop, callbackFn) {
                console.log("Saving proposal from legacy cookie fn")

                store.dispatch('proposal/setProposal', prop)

                if (callbackFn && callbackFn instanceof Function) {
                    callbackFn()
                }
            }
            // Define user permission method - hooked into store
            application.user_can = function(perm) {
                console.log("CHECK USER PERMISSIONS LIST " + JSON.stringify(store.getters.permissions))
                console.log("CHECK USER PERMISSIONS FOR " + perm)
                return store.getters['user/permissions'].indexOf(perm) > -1
            }

            // Method to retrieve user information
            // Don't think we need this as we can load from login component
            application.getuser = function(options) {
                if (store.getters['auth/isLoggedIn']) {
                    store.dispatch('user/getUser', options)
                }
            }

            // Alert is not always used as an error in marionette views.
            // Can be a normal message if the classname is 'message notify'
            // Added check so that if a level is explicitly set, use that, otherwise check className
            application.alert = function(options) {
                var level = 'error'
                if (options.className == 'message notify') level = 'success'

                var payload = {message: options.message, title: options.title, persist: options.persist, level: options.level || level}

                store.commit('notifications/addNotification', payload)
            }

            // Options.level is not commonly used in code.
            // Handled here for future use
            application.message = function(options) {
                var payload = {message: options.message, title: options.title, persist: options.persist, level: options.level || 'success'}
                store.commit('notifications/addNotification', payload)
            }

            application.loading = function(status=true) {
                store.commit('loading', status)
            }

            application.login = function(xhr) {
                // app.bc.reset([{ title: 'Login' }])
                // app.content.show(new LoginView())
                // We have experienced an error and need to login again
                // Message login session has expired...
                store.commit('notifications/addNotification', {message: 'Authentication session has expired, please login again', level: 'error'})
                store.dispatch('auth/logout')
                // Calling mapped function as we don't have a handle to the router in this method
                application.navigate('/login')
            }
        }
        console.log("CONFIG: " + config)
        application.config = config
        // Set the global app variable for legacy code
        window.app = application

         /*
        Single Event for window scrolling
        */
        $(window).scroll(_.debounce(function() {
            app.trigger('window:scroll')
        }, 10))
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

export default MarionetteApplication
