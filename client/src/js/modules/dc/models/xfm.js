define(['backbone'], function(Backbone){

    return Backbone.Model.extend({
        urlRoot: '/dc/xfm',

        parse: function(r, options) {
            return { data: r }
        },

        initialize: function(options) {
            this.bind('sync', this.poll, this)
            this.refresh_thread = null
            this.running = true
            if (options && options.running == false) this.running = false
            this.nimg = options.nimg
            this.pm = options.pm
        },
                                           
      
        stop: function() {
            clearTimeout(this.refresh_thread)
            this.running = false
        },
                                               
        poll: function() {
            clearTimeout(this.refresh_thread)
            if (this.running) {
                var refresh = true
                var d = this.get('data').DATA
                if (d && d[0].length > 0) {
                    if (this.nimg == _.last(d[0])[0]) refresh = false    
                }
                if (this.pm.get('AGE') > 15) refresh = false
                if (refresh) this.refresh_thread = setTimeout(this.fetch.bind(this), 10000)
            }
        },
    })

})