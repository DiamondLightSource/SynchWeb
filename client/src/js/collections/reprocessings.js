define(['backbone.paginator', 'models/reprocessing'], 
    function(PageableCollection, Reprocessing) {
    
    return PageableCollection.extend({
        model: Reprocessing,
        mode: 'server',
        url: '/process',
            
        state: {
            pageSize: 15,
        },

        initialize: function(options) {
            this.bind('sync', this.poll, this)
            this.refresh_thread = null
            this.running = true
        },
          
        stop: function() {
            clearTimeout(this.refresh_thread)
            this.running = false
        },
                                               
        poll: function() {
            clearTimeout(this.refresh_thread)
            if (this.running) {
                this.refresh_thread = setTimeout(this.fetch.bind(this), 5000)
            }
        },

        parseState: function(r, q, state, options) {
            this.running = r.running
            this.waiting = r.waiting
            return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },
        
    })
})
