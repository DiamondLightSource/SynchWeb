define(['backbone.paginator', 'modules/shipment/models/dewarregistry'], function(PageableCollection, DewarRegistry) {
    
    return PageableCollection.extend({
    	model: DewarRegistry,
    	mode: 'server',
        url: '/shipment/dewars/registry',
            
    	state: {
            pageSize: 15,
        },
            
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },

    })
})