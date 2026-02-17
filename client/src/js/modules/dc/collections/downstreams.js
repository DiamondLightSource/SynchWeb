define(['backbone', 'modules/dc/models/downstream'], function(Backbone, DownStream) {

  return Backbone.Collection.extend({
    model: DownStream,
                                    
    url: function() {
        var url = '/processing/downstream/' + this.id
        if (this.dcc > 1) url += '/dcg/1'
        return url
    },

    initialize: function(models, options) {
      this.id = options.id
      this.dcc = options.dcc
    },
  })
       
})
