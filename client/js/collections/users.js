define(['backbone', 'backbone.paginator'], function(Backbone, PageableCollection) {
    
	var User = Backbone.Model.extend({
		idAttribute: 'LOGIN',
	})

    return PageableCollection.extend({
    	model: User,
        url: function() { return '/proposal/users' },
            
        
    })
})