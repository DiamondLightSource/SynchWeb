define(['collections/samples',
    'modules/types/xpdf/models/instance',
    'utils/kvcollection'], function(Samples, Instance, KVCollection) {
    
    return Samples.extend(_.extend({}, KVCollection, {
        model: Instance,

        keyAttribute: 'NAME',
        valueAttribute: 'BLSAMPLEID'
    }))

})
