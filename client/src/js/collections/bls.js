define(['backbone', 'utils/kvcollection'], function(Backbone, KVCollection) {
    
    return Backbone.Collection.extend(_.extend({}, {
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

        keyAttribute: 'BEAMLINE',
        valueAttribute: 'BEAMLINE',

    }, KVCollection))
})