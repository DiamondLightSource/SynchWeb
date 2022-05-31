define(['underscore', 'backbone.paginator', 'models/container', 'utils/kvcollection'], function(_, PageableCollection, Container, KVCollection) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        dewarID: null,
        shipmentID: null,
        model: Container,
        mode: 'server',
        url: function() {
            let link = '/shipment/containers'
            if (this.dewarID) {
                link += `/did/${this.dewarID}`
            } else if (this.shipmentID) {
                link += `/sid/${this.shipmentID}`
            }
            return link
        },
        
        state: {
            pageSize: 15,
        },

        keyAttribute: 'NAME',
        valueAttribute: 'CONTAINERID',
            
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },
    }))
})