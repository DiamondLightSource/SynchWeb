define(['backbone'], function(Backbone){
    
    return Backbone.Model.extend({
        urlRoot: '/em/mc/drift',

        parse: function(r, options) {
          return { data: r }
        },
    })
       
})
