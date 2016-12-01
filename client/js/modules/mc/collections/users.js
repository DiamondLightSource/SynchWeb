define(['backbone', 'utils/kvcollection'], function(Backbone, KVCollection) {

	return Backbone.Collection.extend(_.extend({}, KVCollection, {
		url: function() { return '/mc/users/visit/'+this.visit },

		keyAttribute: 'NAME',
		valueAttribute: 'PERSONID',

		state: {
	      pageSize: 9999,
	    },

		initialize: function(models, options) {
			this.visit = options.visit
		},

	}))


})