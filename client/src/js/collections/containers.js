define(['underscore', 'backbone.paginator', 'models/container', 'utils/kvcollection'], function(_, PageableCollection, Container, KVCollection) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        dewarID: null,
        model: Container,
        mode: 'server',
        url: function() {
            return '/shipment/containers'+(this.dewarID ? ('/did/' + this.dewarID) : '')
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