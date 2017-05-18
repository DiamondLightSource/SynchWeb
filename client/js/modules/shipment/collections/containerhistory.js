define(['backbone.paginator', 'modules/shipment/models/containerhistory'], function(PageableCollection, ContainerHistory) {
    
    return PageableCollection.extend({
        model: ContainerHistory,
        mode: 'server',
        url: '/shipment/containers/history',

        state: {
            pageSize: 10,
        },
            
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },

    })
})