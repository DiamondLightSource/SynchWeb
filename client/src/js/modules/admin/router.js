// define(['marionette', 'modules/admin/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
        
    var Router = LazyRouter.extend({
    // var Router = Marionette.AppRouter.extend({
            appRoutes: {
            'admin/groups': 'manageGroups',
            'admin/groups/:gid': 'viewGroup',
        },

        loadEvents: ['group:show'],

        loadModule: function(loadedCallback) {
            import(/* webpackChunkName: "admin" */ 'modules/admin/controller').then(controller => {
                // Trigger the passed callback
                loadedCallback(controller)
            })
        }
    })
       
    return new Router()
})