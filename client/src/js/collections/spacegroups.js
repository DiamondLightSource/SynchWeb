define(['backbone.paginator', 'utils/kvcollection', 'models/spacegroup'], function(PageableCollection, KVCollection, Spacegroup) {
    
	return PageableCollection.extend(_.extend({}, KVCollection, {
			model: Spacegroup,
			url: '/sample/spacegroups',
			// Currently using short name for consistency with what's displayed and what's stored
			keyAttribute: 'SPACEGROUPSHORTNAME',
			valueAttribute: 'SPACEGROUPSHORTNAME',

			parseState: function(r, q, state, options) {
					return { totalRecords: r.total }
			},
					
			parseRecords: function(r, options) {                
					return r.data
			},
	}))
})