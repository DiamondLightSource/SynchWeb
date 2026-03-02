define(['underscore', 'backbone', 'modules/dc/models/autointegration'], function(_, Backbone, AutoIntegration) {

  return Backbone.Collection.extend({
    model: AutoIntegration,
                                    
    url: function() {
        var url = '/processing/' + this.id
        if (this.dcc > 1) url += '/dcg/1'
        return url
    },

    initialize: function(models, options) {
      this.id = options.id
      this.dcc = options.dcc
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
