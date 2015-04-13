define(['backbone', 'models/pv'], function(Backbone, PV) {
    
    return Backbone.Collection.extend({
        model: PV,
        url: function() { return '/status/pvs/'+this.bl },
            
        initialize: function(models, options) {
            this.bl = options.bl
            
            this.running = true
            this.refresh_thread = null
        },
        
        stop: function() {
            clearTimeout(this.refresh_thread)
            this.running = false
        },
        
        parse: function(r) {
            clearTimeout(this.refresh_thread)
            if (this.running) this.refresh_thread = setTimeout(this.fetch.bind(this), 10000)
            
            var d = []
            _.each(r, function(v,k) {
                d.push({ NAME: k, VALUE: v })
            })
            
            return d
        },
    })
})