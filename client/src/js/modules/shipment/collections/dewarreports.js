define(['backbone.paginator', 'modules/shipment/models/dewarreport'], function(PageableCollection, DewarReport) {
    
    return PageableCollection.extend({
    	model: DewarReport,
    	mode: 'server',
        url: '/shipment/dewars/reports',
            
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