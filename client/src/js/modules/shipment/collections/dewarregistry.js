define(['backbone.paginator', 'modules/shipment/models/dewarregistry', 'utils/kvcollection'], 
    function(PageableCollection, DewarRegistry, KVCollection) {
    
    return PageableCollection.extend(_.extend({
        model: DewarRegistry,
        mode: 'server',
        url: '/shipment/dewars/registry',
            
        state: {
            pageSize: 15,
        },

        keyAttribute: 'FACILITYCODE',
        valueAttribute: 'FACILITYCODE',
            
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },

    }, KVCollection))
})
