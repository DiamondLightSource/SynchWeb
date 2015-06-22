define(['backbone'], function(Backbone){
    
    return Backbone.Model.extend({
        urlRoot: '/dc/dat',

        initialize: function(options) {
			this.timestamp = options.timestamp
			this.bind('sync', this.poll, this)
			this.refresh_thread = null
			this.running = true
		},
			                                   
		parse: function(r, options) {
			return { data: r }
		},

		stop: function() {
			clearTimeout(this.refresh_thread)
			this.running = false
		},
			                                   
		poll: function() {
			clearTimeout(this.refresh_thread)
			if (this.running) {
				var refresh = true
				var d = this.get('data')
				if (d && d[0].length > 0) {
				  if ((new Date() - this.timestamp) > (900*1000)) refresh = false
				}

				if (refresh) this.refresh_thread = setTimeout(this.fetch.bind(this), 10000)
			}
		},
    })
       
})