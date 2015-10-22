define(['backbone.paginator', 'modules/imaging/models/screencomponent'], function(PageableCollection, Component) {
       
  	return PageableCollection.extend({
	    model: Component,
	    mode: 'client',
	    url: '/imaging/screen/components',
	                                      
	    state: {
	      	pageSize: 15,
	    },

	    save: function(options) {
            options = _.extend({}, options)
            
            var col = this
            var success = options.success;
            options.success = function(resp) {
                col.reset(resp)
                if (success) success(col, resp, options);
                col.trigger('sync', col, resp, options);
            };
            
            return Backbone.sync('update', this, options)
        },
      
  	})
})