define(['backbone',
    'backbone.paginator',
    'modules/imaging/models/screencomponentgroup'],
    function(Backbone, PageableCollection, ComponentGroup) {
       
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