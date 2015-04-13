define(['backbone.paginator', 'models/project'], function(PageableCollection, Project) {
    
    return PageableCollection.extend({
        model: Project,
        mode: 'server',
        url: '/projects',
            
        state: {
            pageSize: 15,
        },
        
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },
    })
})