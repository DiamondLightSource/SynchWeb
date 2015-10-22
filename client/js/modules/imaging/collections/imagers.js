define(['backbone.paginator', 'modules/imaging/models/imager'], function(PageableCollection, Imager) {
       
  	return PageableCollection.extend({
	    model: Imager,
	    mode: 'client',
	    url: '/imaging/imager',
	                                      
	    state: {
	      	pageSize: 15,
	    },
      
  	})
})