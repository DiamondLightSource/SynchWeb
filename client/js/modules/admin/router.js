define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'admin/groups': 'manageGroups',
            'admin/groups/:gid': 'viewGroup',

            'admin/proposals': 'manageProposals',
            'admin/proposals/add': 'addProposal',
            'admin/proposals/:prop': 'viewProposal',
            'admin/proposals/visit/add/:prop': 'addVisit',
            'admin/proposals/visit/:visit': 'viewVisit',
        },

        loadEvents: ['group:show', 'proposal:show', 'visit:show'],
    })
       
    return new Router({
        rjsController: 'modules/admin/controller',
    })
})