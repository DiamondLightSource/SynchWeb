define(['backbone.paginator', 'modules/shipment/models/containerregistry', 'utils/kvcollection'], function(PageableCollection, ContainerRegistry, KVCollection) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: ContainerRegistry,
        mode: 'server',
        url: '/shipment/containers/registry',
            
        keyAttribute: 'BARCODE',
        valueAttribute: 'CONTAINERREGISTRYID',

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