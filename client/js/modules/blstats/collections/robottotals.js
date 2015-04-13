define(['underscore', 'backbone', 'backbone.paginator'], function(_, Backbone, PageableCollection) {
    
    var Total = Backbone.Model.extend({
        idAttribute: 'VIS',
    })
    
    return PageableCollection.extend({
        model: Total,
        mode: 'server',
        url: '/robot/totals',
                                          
        state: {
            pageSize: 15,
        },
                                      
        parseState: function(r, q, state, options) {
            return { totalRecords: r[1] }
        },
  
        parseRecords: function(r, options) {
            this.totals = r[0]
            r[2].push(r[0])
            return r[2]
        },

    })
  
})