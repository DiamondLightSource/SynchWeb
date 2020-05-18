define(['backbone.paginator', 'modules/nexus/models/scalar', 'utils/kvcollection'], function(PageableCollection, Scalar, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Scalar,
        mode: 'client',
        url: '/nexus/scalars',
                
        keyAttribute: 'TITLE',
        valueAttribute: 'TITLE',

        state: {
            pageSize: 9999,
        },      
    }))

})
