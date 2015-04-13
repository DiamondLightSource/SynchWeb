define(['underscore', 'backbone.paginator', 'models/container'], function(_, PageableCollection, Container) {
    
    return PageableCollection.extend({
        dewarID: null,
        model: Container,
        mode: 'server',
        url: function() {
            return '/shipment/containers'+(this.dewarID ? ('/did/' + this.dewarID) : '')
        },
        
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