define(['marionette'], function(Marionette) {
    
    /**
     LazyRouter
     Lazy implementation of Marionette.AppRouter, only loads its controller
     when required. r.js optimiser will not be able to find the controller 
     so make sure it is optimised as a standalone.
    */
    
    return LazyRouter = Marionette.AppRouter.extend({
        /** @property {string} Controller to lazy load when required */
        // relative/path/to/controller
        // rjsController: null, // Not using in favour of dynamic import
        
        /** @property {string} Events to trigger a lazy load */
        loadEvents: [],

        loadModule: null, // Callback function that loads module
        
        initialize: function(options) {
            LazyRouter.__super__.initialize.apply(this, options)
            
            this.lazyloaded = false
            
            // if (!this.getOption('rjsController')) {
            //     //throw new Error('No controller specified')
            // }
            
            _.each(this.getOption('loadEvents'), function(e) {
                app.on(e, this.lazyLoad.bind(this,e))
            }, this)
        },
        
        lazyLoad: function(e) {
            var self = this
            var args = arguments

            if (!this.lazyloaded && this.loadModule) {
                this.loadModule(function(controller) {
                    self.lazyloaded = true
                    console.log(e, args)
                    app.trigger.apply(app, args)
                })
            } else {
                console.log("LazyLoader::Error trying to lazy load module ")
            }
        },
        
        _addAppRoute: function(controller, route, methodName) {
            var proxy = function() {
                var self = this
                var args = arguments

                if (this.loadModule) {
                    this.loadModule(function(controller) {
                        controller[methodName].apply(controller, args)
                        self.lazyloaded = true
                    })
                } else {
                    console.log("Error trying to lazy load module ")
                }
            }
            
            this.route(route, methodName, proxy);
        },
    })

})