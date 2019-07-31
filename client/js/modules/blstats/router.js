// define(['marionette', 'modules/blstats/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    // var Router = Marionette.AppRouter.extend({      
    var Router = LazyRouter.extend({
        appRoutes: {
            'statistics(/:type)(/:subtype)': 'stats',
        },

        loadModule: function(loadedCallback) {
            import(/* webpackChunkName: "stats" */ 'modules/blstats/controller').then(m => {
              // Trigger the passed callback
              loadedCallback(m)
            })
        }
    })
       
    return new Router({
        // controller: c
        rjsController: 'modules/blstats/controller',
    })
})