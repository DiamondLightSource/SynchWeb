define(['backbone'], function(Backbone) {
    
    /**
     LazyRouter
     Lazy implementation of Marionette.AppRouter, only loads its controller
     when required. r.js optimiser will not be able to find the controller 
     so make sure it is optimised as a standalone.
    */
    
    return LazyRouter = Marionette.AppRouter.extend({
        /** @property {string} Controller to lazy load when required */
        // relative/path/to/controller
        rjsController: null,
        
        /** @property {string} Events to trigger a lazy load */
        loadEvents: [],
        
        
        initialize: function(options) {
            LazyRouter.__super__.initialize.apply(this, options)
            
            this.lazyloaded = false
            
            if (!this.getOption('rjsController')) {
                //throw new Error('No controller specified')
            }
            
            _.each(this.getOption('loadEvents'), function(e) {
                app.on(e, this.lazyLoad.bind(this,e))
            }, this)
        },
        
        lazyLoad: function(e) {
            var self = this
            var args = arguments
            if (!this.lazyloaded) {
                require([this.getOption('rjsController')], function(c) {
                    self.lazyloaded = true
                    console.log(e, args)
                    app.trigger.apply(app, args)
                })
            }
        },
        
        _addAppRoute: function(controller, route, methodName) {
            var proxy = function() {
                var args = arguments
                require([this.getOption('rjsController')], function(c) {
                    c[methodName].apply(c, args)
                    this.lazyloaded = true
                })
            }
            
            this.route(route, methodName, proxy);
        },
    })

})