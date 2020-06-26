define(['backbone.paginator', 'modules/imaging/models/autoscore', 'utils/kvcollection'], function(PagableCollection, AutoScoreSchema, KVCollection) {

    return PagableCollection.extend(_.extend({}, KVCollection, {
        mode: 'client',
        model: AutoScoreSchema,
        url: '/imaging/inspection/images/scores/auto/schemas',
          
        keyAttribute: 'SCHEMANAME',
        valueAttribute: 'BLSAMPLEIMAGEAUTOSCORESCHEMAID',
    }))

})
