define(['underscore', 'backbone', 'modules/dc/models/autointegration'], function(_, Backbone, AutoIntegration) {

  return Backbone.Collection.extend({
    model: AutoIntegration,
                                    
    url: function() { return '/processing/' + this.id },

    initialize: function(models, options) {
      this.id = options.id
    },
                                    
    parse: function(r, options) {
      var data = []
        
      _.each(r[1], function(e, aid) {
        e.DCID = this.id
        data.push(e)
      }, this)
        
      return data
                                    
    },
  })
       
})