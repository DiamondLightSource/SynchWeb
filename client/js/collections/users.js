define(['backbone'], function(Backbone) {
    
    return Backbone.Collection.extend({
        //model: PV,
        url: function() { return '/proposal/users?visit='+this.visit },
            
        initialize: function(models, options) {
            this.visit = options.visit
        },
        
    })
})