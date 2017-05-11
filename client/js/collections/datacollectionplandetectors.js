define(['backbone.paginator', 'models/datacollectionplandetector'], function(PageableCollection, DataCollectionPlanDetector) {
       
    return PageableCollection.extend({
        model: DataCollectionPlanDetector,
        mode: 'server',
        url: '/exp/plans/detectors',
                                          
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