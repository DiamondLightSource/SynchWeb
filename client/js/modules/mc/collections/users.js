define(['backbone'], function(Backbone) {

	return Backbone.Collection.extend({
		url: function() { return '/mc/users/visit/'+this.visit },

		initialize: function(models, options) {
			this.visit = options.visit
		},

		parse: function(r) {
			var d = []
			_.each(r, function(u, i) {
				d.push({ ID: i, USER: u })
			})

			return d
		}

	})


})