define(['backbone'], function(Backbone) {
    
  var Dewar = Backbone.Model.extend({
      idAttribute: 'DEWARID',
  })
    
  return Backbone.Collection.extend({
    model: Dewar,
      
    initialize: function(models, options) {
        if (options) this.id = options.id
    },      
  })
})