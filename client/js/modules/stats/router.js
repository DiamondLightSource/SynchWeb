//define(['marionette', 'modules/stats/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'stats(/page/:page)': 'proposal',
            'stats/visit/:visit(/from/:from)(/to/:to)': 'visit',
            'stats/overview(/s/:s)(/page/:page)': 'overview',
            'stats/overview/beamlines(/s/:s)(/page/:page)': 'bls_overview',
            'stats/overview/bl/:bl': 'bl_overview',
            'stats/bl/:bl(/run/:run)(/from/:from)(/to/:to)': 'beamline',
        },
        
        loadEvents: ['stats:show'],
    })
       
    return new Router({
        //controller: c
        rjsController: 'modules/stats/controller',
    })
})