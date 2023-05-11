define(['backbone'], function(Backbone) {

	return Backbone.Model.extend({
			urlRoot: '/sample/spacegroups',
			idAttribute: 'SPACEGROUPSHORTNAME',
	})
	
})