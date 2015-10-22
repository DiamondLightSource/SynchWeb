define(['backbone.paginator', 'modules/imaging/models/screencomponentgroup'], function(PageableCollection, ComponentGroup) {
       
  	return PageableCollection.extend({
	    model: ComponentGroup,
	    mode: 'client',
	    url: '/imaging/screen/groups',
	                                      
	    state: {
	      	pageSize: 15,
	    },


	    initialize: function(options) {
            this.on('change:isSelected', this.onSelectedChanged, this)
        },
        
        onSelectedChanged: function(model) {
            this.each(function(model) {
                if (model.get('isSelected') === true && !model._changing) {
                    model.set({isSelected: false})
                }
            })
            this.trigger('selected:change')
        },
      
  	})
})