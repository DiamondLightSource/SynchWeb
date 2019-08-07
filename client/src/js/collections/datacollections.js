define(['underscore', 'backbone', 'backbone.paginator', 'models/datacollection'], function(_, Backbone, PageableCollection, dc) {
  return PageableCollection.extend({
    model: dc,
    mode: 'server',
    url: '/dc',
                                      
    state: {
      pageSize: 15,
    },
                        
    initialize: function(models, options) {
      this.running = true
      if (options && options.running == false) this.running = false
      this.refresh_thread = null
      console.log('dc', options, this.running)

      this.fetched = false
      this.on('sync', this.setFetched, this)

      //if (options && options.queryParams) this.queryParams = $.extend({}, this.queryParams, options.queryParams || {})
    },

    setFetched: function() {
      if (this.fetched) return
        
      this.fetched = true
      this.trigger('reset')
    },
                                      
    stop: function() {
      clearTimeout(this.refresh_thread)
      this.running = false
    },

    run: function() {
        this.running = true
        this.fetch()
    },
                                      
    parseState: function(r, q, state, options) {
      return { totalRecords: r[0]*state.pageSize }
    },

    doFetch: function() {
        clearTimeout(this.refresh_thread)

        var self = this
        if (this.running) {
            this.refresh_thread = setTimeout(function() {
                self.fetch({
                    error: function(resp) {
                        self.doFetch()
                    }
                })
            }, 5000)
        }
    },
  
    parseRecords: function(r, options) {
      this.doFetch()
      return r[1]
    },

  })
  
})