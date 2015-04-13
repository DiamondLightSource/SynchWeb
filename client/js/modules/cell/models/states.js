define(['backbone'], function(Backbone){

    return Backbone.Model.extend({
        urlRoot: function() { return '/cell/state' },
  
                                           
        parse: function(r, options) {
            return { data: r }
        },

    })

})
