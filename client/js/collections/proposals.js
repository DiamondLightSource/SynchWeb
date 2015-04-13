define(['backbone.paginator', 'models/proposal'], function(PageableCollection, Proposal) {
       
  return PageableCollection.extend({
    model: Proposal,
    mode: 'server',
    url: '/proposal',
                                      
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