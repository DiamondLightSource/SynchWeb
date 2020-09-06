// define(['marionette', 'modules/admin/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
        
    var Router = LazyRouter.extend({
    // var Router = Marionette.AppRouter.extend({
        appRoutes: {
            'admin/groups': 'manageGroups',
            'admin/groups/:gid': 'viewGroup',

            'admin/proposals': 'manageProposals',
            'admin/proposals/add': 'addProposal',
            'admin/proposals/:prop': 'viewProposal',
            'admin/proposals/visit/add/:prop': 'addVisit',
            'admin/proposals/visit/:visit': 'viewVisit',

            'admin/users': 'manageUsers',
            'admin/users/add': 'addUser',
            'admin/users/:person': 'viewUser',
        },

        loadEvents: ['group:show', 'proposal:show', 'visit:show', 'useradm:show'],

        loadModule: function(loadedCallback) {
            import(/* webpackChunkName: "admin" */ 'modules/admin/controller').then(controller => {
                // Trigger the passed callback
                loadedCallback(controller)
            })
        }
    })
       
    return new Router({
        // controller: c,
        rjsController: 'modules/admin/controller',
    })
})
