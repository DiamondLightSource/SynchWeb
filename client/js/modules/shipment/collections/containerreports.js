define(['backbone.paginator', 'modules/shipment/models/containerreport'], function(PageableCollection, ContainerReport) {
    
    return PageableCollection.extend({
        model: ContainerReport,
        mode: 'server',
        url: '/shipment/containers/reports',
            
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
