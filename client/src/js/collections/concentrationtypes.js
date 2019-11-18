define(['backbone', 'models/concentrationtype', 'utils/kvcollection'], function(Backbone, ConcentrationType, KVCollection) {
    
    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        model: ConcentrationType, 
        url: '/sample/concentrationtypes',
                                  
        keyAttribute: 'SYMBOL',
        valueAttribute: 'CONCENTRATIONTYPEID',
    }))
    
})
