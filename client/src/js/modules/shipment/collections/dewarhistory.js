define(['backbone.paginator', 'modules/shipment/models/dewarhistory'], function(PageableCollection, DewarHistory) {
    
    return PageableCollection.extend({
        model: DewarHistory,
        mode: 'server',
        url: function() { return '/shipment/dewars/history'+(this.id ? '/did/'+this.id : '') },
            
        initialize: function(models, options) {
            if (options) this.id = options.id
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