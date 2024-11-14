define(['backbone.paginator', 'models/datacollectionsforvisit', 'utils/kvcollection'], function(PageableCollection, DCs, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: DCs,
        mode: 'server',
        visit: null,
        url: function() { return '/processing/visit/'+this.visit },

        initialize(collection, options) {
            if (options && options.queryParams && options.queryParams.visit) {
                this.visit = options.queryParams.visit
            }
        },
                                          
        state: {
            pageSize: 15,
        },
                                          
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },
        
    }))
})
