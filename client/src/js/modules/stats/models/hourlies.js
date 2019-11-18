define(['backbone'], function(Backbone){
    
  return Backbone.Model.extend({
    idAttribute: 'visit',
    urlRoot: '/vstat/hrs',
      
    parse: function(r, options) {
      return { data: r }
    },
  })
       
})