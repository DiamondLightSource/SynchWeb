define(['backbone'], function(Backbone){
    
  return Backbone.Model.extend({
    idAttribute: 'visit',
    urlRoot: '/vstat/breakdown',
  })
       
})