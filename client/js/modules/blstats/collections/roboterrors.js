define(['underscore', 'backbone', 'backbone.paginator'], function(_, Backbone, PageableCollection) {
    
  var Error = Backbone.Model.extend({
      idAttribute: 'ROBOTACTIONID',
  })
    
  return PageableCollection.extend({
    model: Error,
    mode: 'server',
    url: '/robot/errors',
                                      
    state: {
      pageSize: 15,
    },
                                      
    parseState: function(r, q, state, options) {
      return { totalRecords: r[0] }
    },
  
    parseRecords: function(r, options) {
      return r[1]
    },

  })
  
})