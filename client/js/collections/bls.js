define(['backbone'], function(Backbone) {
    
    return Backbone.Collection.extend({
        url: function() { return '/proposal/bls/'+this.ty },
            
        initialize: function(models, options) {
            this.ty = options.ty
        },
        
        parse: function(r) {
            var d = []
            _.each(r, function(bl,i) {
                d.push({ BEAMLINE: bl })
            })
            
            return d
        },
    })
})