define(['backbone'], function(Backbone){
    
    return Backbone.Model.extend({
        urlRoot: '/dc/dat',

        initialize: function(options) {
			this.pm = options.pm
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
				  if (this.pm.get('AGE') > 15) refresh = false
				}

				if (refresh) this.refresh_thread = setTimeout(this.fetch.bind(this), 10000)
			}
		},
    })
       
})