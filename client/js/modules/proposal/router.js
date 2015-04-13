define(['marionette', 'modules/proposal/controller'], function(Marionette, c) {
//define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = Marionette.AppRouter.extend({
    //var Router = LazyRouter.extend({
        appRoutes: {
            'proposal(/page/:page)': 'list',
            'visits(/page/:page)': 'visit_list',
        },
        
        loadEvents: ['proposals:show', 'visits:show'],
    })
       
    return new Router({
        controller: c
        //rjsController: 'modules/proposal/controller',
    })
})