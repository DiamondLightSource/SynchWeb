define(['underscore', 'backbone', 'modules/dc/models/autoindexing'], function(_, Backbone, AutoIndexing) {

  return Backbone.Collection.extend({
    model: AutoIndexing,
                                    
    url: function() { return '/dc/strat/' + this.id },

    initialize: function(models, options) {
      this.id = options.id
    },
                                    
    parse: function(r, options) {
      var data = []
                                    
      _.each(r[1], function(e, t) {
        if (e.STRATS.length) data.push({ TYPE: t, CELL: e.CELL, STRATS: e.STRATS })
      })

      return data
                                    
    },
  })
       
})