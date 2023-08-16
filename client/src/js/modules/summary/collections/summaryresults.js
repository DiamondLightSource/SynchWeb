define(['backbone.paginator', 'modules/summary/models/summaryresult'], function(PageableCollection, SummaryResult) {
       
    return PageableCollection.extend({
        model: SummaryResult,
        mode: 'server',
        // url: '/summary/example',
        url: '/summary/results',
                                    

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