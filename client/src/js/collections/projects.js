define(['backbone.paginator', 'models/project', 'utils/kvcollection'], function(PageableCollection, Project, KVCollection) {
    
    return PageableCollection.extend(_.extend({
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

        keyAttribute: 'ACRONYM',
        valueAttribute: 'PROJECTID'

    }, KVCollection))
})