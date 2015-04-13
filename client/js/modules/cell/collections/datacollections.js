define(['backbone', 'backbone.paginator'], function(Backbone, PageableCollection) {

    
    var DC = Backbone.Model.extend({
        idAttribute: 'AUTOPROCINTEGRATIONID',
    })
    
    return PageableCollection.extend({
        model: DC,
        mode: 'server',
        url: '/cell',
            
        state: {
            pageSize: 15,
        },
            
        queryParams: {
            pageSize: 'pp',
        },
        
        parseState: function(r, q, state, options) {
            return { totalRecords: parseInt(r[0]) }
        },
            
        parseRecords: function(r, options) {
            return r[2]
        },
    
    })
})