//define(['marionette', 'modules/fault/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'faults(/page/:page)': 'list',
            'faults/fid/:fid': 'view',
            'faults/add': 'add',
            'faults/edit': 'edit',
        },
        
        loadEvents: ['fault:show'],
    })
       
    return new Router({
        //controller: c
        rjsController: 'modules/fault/controller',
    })
})