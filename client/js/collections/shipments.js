define(['backbone.paginator', 'models/shipment', 'utils/kvcollection'], function(PageableCollection, Shipment, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Shipment,
        mode: 'server',
        url: '/shipment/shipments',
                                      
        keyAttribute: 'SHIPPINGNAME',
        valueAttribute: 'SHIPPINGID',

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