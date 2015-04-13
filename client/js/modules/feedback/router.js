define(['marionette', 'modules/feedback/controller'], function(Marionette, c) {
//define(['utils/lazyrouter'], function(LazyRouter) {
    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            'feedback': 'feedback',
        }
    })
       
    return new Router({
        controller: c
        //rjsController: 'modules/feedback/controller',
    })
})