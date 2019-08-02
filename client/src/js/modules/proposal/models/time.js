define(['backbone'], function(Backbone) {

	return Backbone.Model.extend({
		urlRoot: '/users/time',

		time: function() {
			return this.get('TIME')
		}
	})
	
})