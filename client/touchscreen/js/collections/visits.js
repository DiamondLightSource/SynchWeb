define(['backbone'], function(Backbone) {
       
  return Backbone.Collection.extend({
    url: '/assign/visits',    
  })
})