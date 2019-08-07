define(['backbone'], function(Backbone) {
    
    return Backbone.Collection.extend({
        url: function() { return '/status/epics/'+this.bl+'/c/'+this.epid },
        
        initialize: function(attrs, options){
            this.bl = options.bl
            this.epid = options.epid
            
            this.running = true
            if (options && options.running == false) this.running = false
            this.refresh_thread = null
        },
                                          
        stop: function() {
            clearTimeout(this.refresh_thread)
            this.running = false
        },

        parse: function(r, options) {
            clearTimeout(this.refresh_thread)
            if (this.running) this.refresh_thread = setTimeout(this.fetch.bind(this), 5000)
                
            var mots = []
            _.each(r, function(vals, k) {
                mots.push(_.extend(vals, { title: k }))
            }, this)
                
            return mots
        },
    })


})