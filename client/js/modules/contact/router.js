//define(['marionette', 'modules/contact/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'contacts(/page/:page)': 'list',
            'contacts/cid/:cid': 'view',
            'contacts/add': 'add',
        },
        
        loadEvents: ['contact:show'],
    })
       
    return new Router({
        //controller: c
        rjsController: 'modules/contact/controller',
    })
})