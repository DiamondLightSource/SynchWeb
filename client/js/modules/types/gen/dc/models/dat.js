define(['backbone'], function(Backbone){
    
    return Backbone.Model.extend({
        urlRoot: '/dc/dat',
        
        parse: function(r, options) {
            return { data: r }
        },
    })
       
})