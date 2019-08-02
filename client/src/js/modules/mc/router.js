define(['marionette', 'modules/mc/controller'], function(Marionette, c) {
// define(['utils/lazyrouter'], function(LazyRouter) {
    
    // var Router = LazyRouter.extend({
    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            'mc/visit/:visit(/page/:page)(/s/:search)': 'dcs',
        },
        
        loadEvents: [],
    })
       
    return new Router({
        controller: c
        // rjsController: 'modules/mc/controller',
    })
})
