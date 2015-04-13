define(['backbone', 'models/dewar'], function(Backbone, Dewar) {
       
  return Backbone.Collection.extend({
    model: Dewar,
    url: function() { return '/shipment/dewars/sid/'+this.id },
      
    initialize: function(models, options) {
        if (options) this.id = options.id
    },      
  })
})