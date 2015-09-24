define(['backbone.paginator', 'modules/dc/models/dccomment'], function(PageableCollection, DCComment) {
       
    return PageableCollection.extend({
        model: DCComment,
        mode: 'server',
        url: '/dc/comments',
                                          
        state: {
          pageSize: 10,
        },
                                          
        parseState: function(r, q, state, options) {
          return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },

    })
})