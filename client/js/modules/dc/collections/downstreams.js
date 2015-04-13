define(['backbone', 'modules/dc/models/downstream'], function(Backbone, DownStream) {

  return Backbone.Collection.extend({
    model: DownStream,
                                    
    url: function() { return '/dc/dp/' + this.id },

    initialize: function(models, options) {
      this.id = options.id
    },

  })
       
})