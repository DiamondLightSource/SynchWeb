define(['marionette', 'modules/status/controller'], function(Marionette, c) {
//define(['utils/lazyrouter'], function(LazyRouter) {
    
    //var Router = LazyRouter.extend({
    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            'status/bl/:bl': 'status',
        }
    })
       
    return new Router({
        controller: c
        //rjsController: 'modules/status/controller',
    })
})