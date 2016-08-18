//define(['marionette', 'modules/stats/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'stats(/page/:page)': 'proposal',
            'stats/visit/:visit': 'visit',
            'stats/overview(/s/:s)(/page/:page)': 'overview',
        },
        
        loadEvents: ['stats:show'],
    })
       
    return new Router({
        //controller: c
        rjsController: 'modules/stats/controller',
    })
})