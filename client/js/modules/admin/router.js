define(['marionette', 'modules/admin/controller'], function(Marionette, c) {
// define(['utils/lazyrouter'], function(LazyRouter) {
        
    // var Router = LazyRouter.extend({
    var Router = Marionette.AppRouter.extend({
            appRoutes: {
            'admin/groups': 'manageGroups',
            'admin/groups/:gid': 'viewGroup',
        },

        loadEvents: ['group:show'],
    })
       
    return new Router({
        controller: c
        // rjsController: 'modules/admin/controller',
    })
})