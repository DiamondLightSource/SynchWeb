define(['backbone'], function(Backbone){
    
  return Backbone.Model.extend({
    urlRoot: '/dc/ed',

      
    parse: function(r, options) {
      return { RAW: r[0], FDP: r[1], FP: r[2] }
    },
      
  })

})