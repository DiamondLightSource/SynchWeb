define(['backbone'], function(Backbone){

    return Backbone.Model.extend({
        urlRoot: function() { return '/mc/status'+(this.local ? '/local/1' : '') },
                       
        initialize: function(options) {
            this.bind('sync', this.poll, this)
            this.refresh_thread = null
            this.running = true
            if (options && options.local) this.local = true
        },
          
        stop: function() {
            clearTimeout(this.refresh_thread)
            this.running = false
        },
                                               
        poll: function() {
            clearTimeout(this.refresh_thread)
            if (this.running) {
                this.refresh_thread = setTimeout(this.fetch.bind(this), 5000)
            }
        },
    })
       
})