define(['backbone', 'utils/kvcollection', 'models/protein'], function(Backbone, KVCollection, Protein) {
    
    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        model: Protein,
        idAttribute: 'PROTEINID',
        url: '/sample/proteins/distinct',
        
        initialize: function(options) {
            this.on('fetch', this.fetch, this)
        },
        
        keyAttribute: 'ACRONYM',
        valueAttribute: 'PROTEINID',
    }))
})