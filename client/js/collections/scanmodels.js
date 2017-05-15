define(['backbone.paginator', 'models/scanmodel'], function(PageableCollection, ScanModel) {
       
    return PageableCollection.extend({
        model: ScanModel,
        mode: 'server',
        url: '/exp/parameters/models',
                                          
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