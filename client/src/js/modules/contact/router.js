define(['marionette', 'modules/contact/controller'], function(Marionette, c) {
// define(['utils/lazyrouter'], function(LazyRouter) {
    var Router = Marionette.AppRouter.extend({
    // var Router = LazyRouter.extend({
        appRoutes: {
            'contacts(/page/:page)': 'list',
            'contacts/cid/:cid': 'view',
            'contacts/add': 'add',

            'contacts/user(/:pid)': 'edit_user',
        },
        
        loadEvents: ['contact:show', 'user:show'],
    })
       
    return new Router({
        controller: c
        // rjsController: 'modules/contact/controller',
    })
})