define(['backbone'], function(Backbone) {

	return Backbone.Model.extend({
		urlRoot: '/proposal/time',

		time: function() {
			return this.get('TIME')
		}
	})
	
})