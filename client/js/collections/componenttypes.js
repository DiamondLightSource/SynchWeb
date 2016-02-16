define(['backbone', 'models/componenttype', 'utils/kvcollection'], function(Backbone, ComponentType, KVCollection) {
    
    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        model: ComponentType, 
        url: '/sample/componenttypes',
                                  
        keyAttribute: 'NAME',
        valueAttribute: 'COMPONENTTYPEID',
    }))
    
})
