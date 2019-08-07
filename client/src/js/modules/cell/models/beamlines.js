define(['backbone'], function(Backbone){

    return Backbone.Model.extend({
        urlRoot: function() { return '/cell/bl' },
  
                                           
        parse: function(r, options) {
            return { data: r }
        },

    })

})
