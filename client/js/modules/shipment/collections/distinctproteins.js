define(['backbone.paginator', 'utils/kvcollection', 'models/protein'], function(PageableCollection, KVCollection, Protein) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        mode: 'client',
        state: {
            pageSize: 9999,
        },
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