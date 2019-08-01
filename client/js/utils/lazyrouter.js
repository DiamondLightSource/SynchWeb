define(['marionette'], function(Marionette) {
    
    /**
     LazyRouter
     Lazy implementation of Marionette.AppRouter, only loads its controller
     when required. r.js optimiser will not be able to find the controller 
     so make sure it is optimised as a standalone.
    */
    return LazyRouter = Marionette.AppRouter.extend({
        /** @property {string} Events to trigger a lazy load */
        loadEvents: [],

        // loadModule: Callback function that imports a js module.
        // It should take a callback parameter which it triggered on successful import/load
        // function(cb) { import(/* webpackChunkName: "chunkname" */).then(m => { cb(m) })}
        loadModule: null,

        initialize: function(options) {
            LazyRouter.__super__.initialize.apply(this, options)

            this.lazyloaded = false

            _.each(this.getOption('loadEvents'), function(e) {
                app.on(e, this.lazyLoad.bind(this,e))
            }, this)
        },
        
        lazyLoad: function(e) {
            var self = this
            var args = arguments

            if (!this.lazyloaded && typeof this.loadModule === "function") {
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

                if (typeof this.loadModule === "function") {
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