define(['backbone.paginator', 'modules/fault/models/fault'], function(PageableCollection, Fault) {
       
    return PageableCollection.extend({
        model: Fault,
        mode: 'server',
        url: '/fault',
                                          
        state: {
            pageSize: 20,
        },
        
        queryParams: {
          pageSize: 'pp',
        },
                                          
        parseState: function(r, q, state, options) {
          return { totalRecords: r[0]*this.state.pageSize }
        },
      
        parseRecords: function(r, options) {
            return r[1]
        },
    })
})