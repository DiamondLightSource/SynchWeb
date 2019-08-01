// define(['marionette', 'modules/docs/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    // var Router = Marionette.AppRouter.extend({
    var Router = LazyRouter.extend({
        appRoutes: {
            'docs(/:id)': 'docs',
        },
        loadModule: function(loadedCallback) {
            import(/* webpackChunkName: "help" */ 'modules/docs/controller').then(controller => {
                // Trigger the passed callback
                loadedCallback(controller)
            })
        }
    })
       
    return new Router()
})