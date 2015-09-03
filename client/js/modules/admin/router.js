define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'admin/groups': 'manageGroups',
            'admin/groups/:gid': 'viewGroup',
        },

        loadEvents: ['group:show'],
    })
       
    return new Router({
        rjsController: 'modules/admin/controller',
    })
})