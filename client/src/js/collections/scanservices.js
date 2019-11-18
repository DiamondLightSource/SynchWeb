define(['backbone.paginator', 'models/scanservice', 'utils/kvcollection'], function(PageableCollection, ScanService, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: ScanService,
        mode: 'client',
        url: '/exp/parameters/services',
                                          
        state: {
            pageSize: 15,
        },

        keyAttribute: 'NAME',
        valueAttribute: 'SCANPARAMETERSSERVICEID',

    }))
})