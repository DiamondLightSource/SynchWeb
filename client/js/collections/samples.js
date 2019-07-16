define(['backbone', 'underscore', 'backbone.paginator', 'models/sample'], function(Backbone, _, PageableCollection, Sample) {
    
    return PageableCollection.extend({
        model: Sample,
        mode: 'server',
        url: '/sample',

        comparator: function(s) {
            return parseInt(s.get('LOCATION'))
        },
            
        state: {
            pageSize: 15,
        },
        
        initialize: function(collection, options) {
            this.running = options && options.poll
            this.refresh_thread = null

            this.on('change:isSelected', this.onSelectedChanged, this)

            this.fetched = false
            this.on('sync', this.setFetched, this)
        },

        setFetched: function() {
          if (this.fetched) return
          console.log('fetched samples')
          this.fetched = true
          this.trigger('reset')
        },
        
        onSelectedChanged: function(model) {
            this.each(function(model) {
                if (model.get('isSelected') === true && !model._changing) {
                    model.set({isSelected: false}, { silent: true })
                }
            })
            console.log('trigger selected change')
            this.trigger('selected:change')
        },
        
        
        stop: function() {
            clearTimeout(this.refresh_thread)
            this.running = false
        },
        
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            clearTimeout(this.refresh_thread)
            if (this.running) this.refresh_thread = setTimeout(this.fetch.bind(this), 5000)
                
            return r.data
        },


        // This lets us register all samples simultaneously
        save: function(options) {
            options = _.extend({}, options)
            
            var col = this
            var success = options.success;
            options.success = function(resp) {
                col.reset(resp, { silent: true })
                if (success) success(col, resp, options)
                //col.trigger('sync', col, resp, options)
            }
            
            return Backbone.sync('create', this, options)
        },
    })
})