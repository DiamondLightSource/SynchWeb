define(['backbone.paginator', 'modules/blstats/models/user'], function(PageableCollection, User) {
    
    return PageableCollection.extend({
        model: User,
        mode: 'client',
        url: '/stats/online',

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
    })

})