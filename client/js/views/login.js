define(['views/form',
    'tpl!templates/login.html',
    'jquery',
    'backbone',
    
    'jquery-ui',
    'backbone-validation',
    
    ], function(FormView,
        template, $, Backbone) {


    var Login = Backbone.Model.extend({
        url: '/authenticate',
    })


    return FormView.extend({
        template: template,
        
        createModel: function() {
            this.model = new Login()
        },

        onShow: function() {
            if (app.token) {
                console.log('invald token alert')
                app.alert({ message: 'Your session has expired, please log in again', persist: 'login' })
                // app.token = null
            }
        },
        
        success: function(model, response, options) {
            app.token = response.jwt
            sessionStorage.setItem('token', app.token)
            console.log('success from login', app.token)
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