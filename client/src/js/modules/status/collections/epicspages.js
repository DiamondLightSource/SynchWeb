define(['backbone', 'utils/kvcollection'], function(Backbone, KVCollection) {
    
    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        url: function() { return '/status/ep/'+this.bl },
        
        initialize: function(models, options) {
            this.bl = options.bl
        },
        
        keyAttribute: 'NAME',
        valueAttribute: 'ID',
        
        parse: function(resp, xhr, options) {
            var pages = []
            _.each(resp, function(v,k) {
                pages.push({ ID: k, NAME: v })
            }, this)
            
            return pages
        },
    }))


})