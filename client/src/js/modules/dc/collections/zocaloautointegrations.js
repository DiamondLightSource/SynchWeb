define(['underscore', 'backbone', 'modules/dc/models/zocaloautointegration'], function(_, Backbone, ZocaloAutoIntegration) {

    return Backbone.Collection.extend({
      model: ZocaloAutoIntegration,
                                      
      url: function() { return '/dc/ap/zocalo/' + this.id },
  
      initialize: function(models, options) {
        this.id = options.id
      },
                                      
      parse: function(r, options) {
        var data = []
          
        _.each(r, function(e, aid) {
          e.DCID = this.id
          data.push(e)
        }, this)
          
        return data
                                      
      },
    })
         
  })