define(['backbone.paginator', 'modules/imaging/models/schedule', 'utils/kvcollection'], function(PageableCollection, Schedule, KVCollection) {
       
  	return PageableCollection.extend(_.extend({}, KVCollection, {
	    model: Schedule,
	    mode: 'client',
	    url: '/imaging/schedule',
	               	
	    keyAttribute: 'NAME',
	    valueAttribute: 'SCHEDULEID',

	    state: {
	      	pageSize: 100,
	    },
      
  	}))
})