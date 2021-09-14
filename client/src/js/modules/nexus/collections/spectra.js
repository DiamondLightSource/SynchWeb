define(['backbone.paginator', 'modules/nexus/models/spectrum', 'utils/kvcollection'], function(PageableCollection, Spectrum, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Spectrum,
        mode: 'client',
        url: '/nexus/spectra',
                
        keyAttribute: 'TITLE',
        valueAttribute: 'TITLE',

        state: {
            pageSize: 9999,
        },      
    }))

})
