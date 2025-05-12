define(['backbone'], function(Backbone) {

  return Backbone.Collection.extend({

    url: function() { return '/dc/grid/xrc/' + this.id },

    initialize: function(options) {
      this.id = options.id
    },

    parse: function(r) {
      return r.data
    },
  })

})
