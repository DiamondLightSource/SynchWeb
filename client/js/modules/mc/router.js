define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'mc/visit/:visit(/page/:page)(/s/:search)': 'dcs',
            'mc/blend/visit/:visit': 'blend'
        },
        
        loadEvents: [],
    })
       
    return new Router({
        rjsController: 'modules/mc/controller',
    })
})
