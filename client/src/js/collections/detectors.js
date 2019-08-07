define(['backbone.paginator', 'models/detector', 'utils/kvcollection'], function(PageableCollection, Detector ,KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Detector,
        mode: 'client',
        url: '/exp/detectors',
                                          
        state: {
            pageSize: 15,
        },
        
        keyAttribute: 'DESCRIPTION',
        valueAttribute: 'DETECTORID',

    }))
})