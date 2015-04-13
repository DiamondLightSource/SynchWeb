define(['marionette', 'modules/docs/controller'], function(Marionette, c) {
//define(['utils/lazyrouter'], function(LazyRouter) {
    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            'docs(/:id)': 'docs',
        }
    })
       
    return new Router({
        controller: c
        //rjsController: 'modules/docs/controller',
    })
})