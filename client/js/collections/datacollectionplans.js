define(['backbone.paginator', 'models/datacollectionplan'], function(PageableCollection, DataCollectionPlan) {
       
    return PageableCollection.extend({
        model: DataCollectionPlan,
        mode: 'server',
        url: '/exp/plans',
                                          
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