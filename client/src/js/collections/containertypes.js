define(['backbone', 'utils/kvcollection'], function(Backbone, KVCollection) {
    
    return Backbone.Collection.extend({
        
        initialize: function(options) {
            this.add({ name: 'Puck' })
            this.add({ name: 'CrystalQuickX', plate: 1 })
        },
        
        keyAttribute: 'name',
        valueAttribute: 'name',
    })
})