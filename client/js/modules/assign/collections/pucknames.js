define(['backbone.paginator'], function(PageableCollection) {
    
    return PageableCollection.extend({
        mode: 'client',
        url: '/assign/names',

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
                this.refresh_thread = setTimeout(this.fetch.bind(this), 10000)
            }
        },
    })

})