define(['backbone.paginator'], function(PageableCollection, Container) {
    
    return PageableCollection.extend({
        mode: 'server',
        url: '/shipment/containers',
        
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