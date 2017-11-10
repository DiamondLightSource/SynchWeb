define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'mc/visit/:visit(/page/:page)(/s/:search)': 'dcs',
        },
        
        loadEvents: [],
    })
       
    return new Router({
        rjsController: 'modules/mc/controller',
    })
})
