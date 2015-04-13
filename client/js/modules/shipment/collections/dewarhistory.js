define(['backbone'], function(Backbone) {
    
    return Backbone.Collection.extend({
        url: function() { return '/shipment/dewars/history/'+this.id },
            
        initialize: function(models, options) {
            if (options) this.id = options.id
        },
    })
})