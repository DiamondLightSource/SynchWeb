define(['backbone', 'utils/kvcollection'], function(Backbone, KVCollection) {
    
    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        initialize: function(models, options) {
            this.pid = options && options.pid
        },
        url: function() {
            return this.pid ? '/sample/elements/pid/'+this.pid : '/sample/elements'
        },
        model: Backbone.Model.extend({
            idAttribute: 'COMPONENTID',
        }),
        keyAttribute: 'NAME',
        valueAttribute: 'COMPONENTID',
    }))
})
