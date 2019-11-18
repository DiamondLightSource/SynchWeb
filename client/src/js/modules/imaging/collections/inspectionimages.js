define(['backbone.paginator', 'modules/imaging/models/inspectionimage'], function(PageableCollection, InspectionImage) {
       
  	return PageableCollection.extend({
	    model: InspectionImage,
	    mode: 'client',
	    url: '/imaging/inspection/images',
	                                      
	    state: {
	      	pageSize: 9999,
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
            // this.trigger('selected:change', this.findWhere({ isSelected: true }))
        },
      
  	})
})