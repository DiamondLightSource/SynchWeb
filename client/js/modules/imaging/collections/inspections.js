define(['backbone.paginator', 'modules/imaging/models/inspection', 'utils/kvcollection'], 
	function(PageableCollection, Inspection, KVCollection) {
       
  	return PageableCollection.extend(_.extend({}, KVCollection, {
		model: Inspection,
		mode: 'server',
		url: '/imaging/inspection',

		keyAttribute: 'TITLE',
        valueAttribute: 'CONTAINERINSPECTIONID',
		                                  
		state: {
		  	pageSize: 15,
		},

		parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },
      
  	}))
})