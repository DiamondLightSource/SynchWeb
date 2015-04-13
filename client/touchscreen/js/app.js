define(['backbone', 'marionette', 'jquery',
        'models/visit', 'collections/visits',
        'views/assign', 'views/visits',
        'jquery.mobile',],
function(Backbone, Marionette, $, Router,
    Visit, Visits,
    AssignView, VisitsView
    ) {

    window.app = new Marionette.Application()


    app.apiurl = '/client/api'
    

    var oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        var url = _.isFunction(model.url) ? model.url() : model.url;

        if (url) {
            options = options || {};
            options.url = app.apiurl+url.replace('/ajax', '')
        }
      
        return oldSync.call(this, method, model, options);
    }

    app.views = {};
        
    app.addInitializer(function(options){
        require(['router'], function(Router) {
            app.router = Router
            
            Marionette.View.prototype.onRender = Marionette.View.prototype.onShow = function() {
                this.$el.enhanceWithin()
                return this
            }

            $(document).on("click", "a", function(e) {
                e.preventDefault()
                app.navigate($(this).attr('href'));
            })
            
            app.navigate = function (url) {
                app.router.navigate(url, { trigger: true });
            }
            
            if(Backbone.history){
                Backbone.history.start({ pushState: false, root: '/client/touchscreen' });
                
                Backbone.history.on('route', function() {
                    console.log('routing', arguments)
                })
            }
        })
        
    })
       
    return app
})