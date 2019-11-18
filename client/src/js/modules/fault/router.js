// define(['marionette', 'modules/fault/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    // var Router = Marionette.AppRouter.extend({
    var Router = LazyRouter.extend({
        appRoutes: {
            'faults(/bl/:bl)(/sys/:sys)(/com/:com)(/sub/:sub)(/page/:page)': 'list',
            'faults/fid/:fid': 'view',
            'faults/add': 'add',
            'faults/edit': 'edit',
        },
        
        loadEvents: ['fault:show'],

        loadModule: function(loadedCallback) {
            import(/* webpackChunkName: "admin" */ 'modules/fault/controller').then(controller => {
                // Trigger the passed callback
                loadedCallback(controller)
            })
        }
    })
       
    return new Router()
})