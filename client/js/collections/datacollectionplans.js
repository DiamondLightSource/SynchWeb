define(['backbone.paginator', 'models/datacollectionplan'], function(PageableCollection, DataCollectionPlan) {
       
    return PageableCollection.extend({
        model: DataCollectionPlan,
        mode: 'server',
        url: '/exp/plans',

        comparator: 'PLANORDER',
        // comparator: function(m) {
        //     return parseInt(m.get('PLANORDER'))
        // },

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
