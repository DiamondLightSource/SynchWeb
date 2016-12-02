define(['backbone.paginator', 'modules/imaging/models/imager', 'utils/kvcollection'], function(PageableCollection, Imager, KVCollection) {
       
  	return PageableCollection.extend(_.extend({}, KVCollection, {
	    model: Imager,
	    mode: 'client',
	    url: '/imaging/imager',

	    keyAttribute: 'NAME',
	    valueAttribute: 'IMAGERID',
	                                      
	    state: {
	      	pageSize: 15,
	    },
      
  	}))
})