define(['backbone', 'utils/kvcollection'], function(Backbone, KVCollection) {

    var BL = Backbone.Model.extend({
        idAttribute: 'NAME',
    })
    
    
    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        model: BL,
        url: '/fault/bls',
        
        keyAttribute: 'NAME',
        valueAttribute: 'NAME',
    }))


})