define(['backbone.paginator', 'models/crystal', 'utils/kvcollection'], 
    function(PageableCollection, Crystal, KVCollection) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Crystal,
        mode: 'server',
        url: '/sample/crystals',
            
        keyAttribute: 'NAME',
        valueAttribute: 'CRYSTALID',

        state: {
            pageSize: 15,
        },
            
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },


        initialize: function(collection, options) {
            this.fetched = false
            this.on('sync', this.setFetched, this)
        },

        setFetched: function() {
          if (this.fetched) return
            
          this.fetched = true
          this.trigger('reset')
        },
    }))
})
