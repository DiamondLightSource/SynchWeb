define(['backbone'], function(Backbone) {
       
  return Backbone.Collection.extend({
    url: function() { return '/vstat/call/'+this.visit },
      
    initialize: function(models, options) {
        if (options) this.visit = options.visit
    },      
  })
})