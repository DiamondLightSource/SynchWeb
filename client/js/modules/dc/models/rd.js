define(['backbone'], function(Backbone){

  return Backbone.Model.extend({
    urlRoot: function() { return '/dc/rd/aid/'+this.aid },
      
    initialize: function(options) {
        this.id = options.id
        this.aid = options.aid
    },
      
    parse: function(r, options) {
      return { data: r }
    },

  })
       
})