define(['marionette', 'modules/calendar/controller'], function(Marionette, c) {
//define(['utils/lazyrouter'], function(LazyRouter) {
    
    //var Router = LazyRouter.extend({
    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            'cal': 'calendar',
            'calendar': 'calendar_prop',
            'log': 'current',
            '': 'goHome',
        },
        
        loadEvents: ['current:show'],
    })
       
    return new Router({
        controller: c
        //rjsController: 'modules/calendar/controller',
    })
})