define(['backbone.paginator', 'utils/kvcollection', 'models/protein'], function(PageableCollection, KVCollection, Protein) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        mode: 'client',
        state: {
            pageSize: 9999,
        },
        model: Protein,
        idAttribute: 'PROTEINID',
        url: '/sample/proteins/distinct',
        
        initialize: function() {
            this.on('fetch', this.fetch, this)
        },

        parseState: function(r) {
            return { totalRecords: r.total }
        },

        parseRecords: function(r) {
            clearTimeout(this.refresh_thread)
            if (this.running) this.refresh_thread = setTimeout(this.fetch.bind(this), 5000)

            return r.data
        },
        
        keyAttribute: 'ACRONYM',
        valueAttribute: 'PROTEINID',
    }))
})