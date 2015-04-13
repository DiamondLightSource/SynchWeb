define(['backbone.paginator', 'modules/blstats/models/user'], function(PageableCollection, User) {
    
    return PageableCollection.extend({
        model: User,
        mode: 'client',
        url: '/stats/last',
    })

})