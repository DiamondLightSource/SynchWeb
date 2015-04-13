define(['backbone', 'utils/kvcollection'], function(Backbone, KVCollection) {
    
    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        idAttribute: 'PROTEINID',
        url: '/sample/proteins/distinct',
        
        initialize: function(options) {
            this.on('fetch', this.fetch, this)
        },
        
        keyAttribute: 'ACRONYM',
        valueAttribute: 'PROTEINID',
    }))
})