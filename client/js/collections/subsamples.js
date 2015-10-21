define(['backbone.paginator', 'models/subsample'], function(PageableCollection, Subsample) {
       
  	return PageableCollection.extend({
	    model: Subsample,
	    mode: 'client',
	    url: '/sample/sub',
	                                      
	    state: {
	      	pageSize: 100,
	    },

	    initialize: function(options) {
            this.on('change:isSelected', this.onSelectedChanged, this)
        },
        
        onSelectedChanged: function(model) {
            this.each(function(model) {
                if (model.get('isSelected') === true && !model._changing) {
                    model.set({ isSelected: false })
                }
            })
        },
      
  	})
})