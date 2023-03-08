define(['backbone.paginator', 'models/detector', 'utils/kvcollection'], function(PageableCollection, Detector ,KVCollection) {

    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Detector,
        mode: 'server',
        url: '/exp/detectors',
        
        keyAttribute: 'DESCRIPTION',
        valueAttribute: 'DETECTORID',

        state: {
            pageSize: 5,
        },

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },

        parseRecords: function(r, options) {
            return r.data
        },
    }))
})
