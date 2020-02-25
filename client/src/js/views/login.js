define(['views/form',
    'templates/login.html',
    'jquery',
    'backbone',

    'backbone-validation',
    
    ], function(FormView,
        template, $, Backbone) {


    var Login = Backbone.Model.extend({
        url: '/authenticate',
        validation: {
            login: {
                required: true,
                pattern: 'word',
            },

            password: {
                required: true
            },
        }
    })


    return FormView.extend({
        template: template,
        
        createModel: function() {
            this.model = new Login()
        },

        onRender: function() {
            this.checkExistingSession()
        },

        // Hack for CAS SSO
        checkExistingSession: function() {
            app.alert({ message: 'Checking for an existing session' })
            this.$el.find('form').addClass('loading')

            var self = this
            var fr = $('iframe')
            fr.load(function() {
                var content = fr.contents().text()
                if (content) {
                    try {
                        var response = JSON.parse(content)
                        if ('jwt' in response) {
                            app.alert({ message: 'Found a valid session, auto-logging you in' })
                            self.$el.find('form').addClass('loading')
                            setTimeout(function() {
                                self.setToken(response)
                            }, 2000)
                        }

                        if ('error' in response) {
                            self.$el.find('form').removeClass('loading')
                            self.redirect()

                        }
                    } catch(err) {
                        // Not valid JSON
                        console.log('catching error')
                        self.redirect()
                        self.$el.find('form').removeClass('loading')
                    }
                }
            })
            fr.attr('src',app.apiurl+'/authenticate/check')
        },

        redirect: function() {
            if (app.options.get('authentication_type') == 'cas' && app.options.get('cas_sso') == true && location.href.indexOf('?ticket=') == -1)
                window.location.href='https://'+app.options.get('cas_url')+'/cas/login?service='+encodeURIComponent(window.location.href)            
        },

        onShow: function() {
            if (app.token) {
                console.log('invald token alert')
                app.alert({ message: 'Your session has expired, please log in again', persist: 'login' })
            }
        },
        
        success: function(model, response, options) {
            this.setToken(response)
        },

        setToken: function(response) {
            app.token = response.jwt

            sessionStorage.setItem('token', app.token)
            this.$el.find('form').addClass('loading')
            app.getuser({
                callback: function() {
                    var url = window.location.pathname.substr(Backbone.history.root.length);
                    if (url) {
                        app.navigate('/', { trigger: false });
                        app.navigate(url, { trigger: true });
                    } else app.trigger('go:home')
                }
            })
        },

        failure: function(model, response, options) {
            console.log('failure from login')
            app.alert({ message: 'We couldnt log you in, maybe your password or username were incorrect?'})
        },
    })

})