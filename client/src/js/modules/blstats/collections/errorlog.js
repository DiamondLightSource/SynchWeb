define(['underscore', 'backbone', 'backbone.paginator'], function(_, Backbone, PageableCollection) {
    
  var Error = Backbone.Model.extend({
      idAttribute: 'visit',
      urlRoot: '/vstat/errors',
  })
    
  return PageableCollection.extend({
    model: Error,
    mode: 'client',
    url: '/vstat/errors',
                                      
    state: {
      pageSize: 15,
    },

  })
  
})
