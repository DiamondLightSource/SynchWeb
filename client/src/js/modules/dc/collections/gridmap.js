define(['backbone', 'backbone.paginator'],
    function(Backbone, PageableCollection) {
       
    var GridMapModel = Backbone.Model.extend({
        idAttribute: 'IMAGENUMBER',
    })

    return PageableCollection.extend({
        model: GridMapModel,
        mode: 'client',
        url: '/dc/grid/map',
                                          
        state: {
            pageSize: 9999,
        },

        initalize: function() {
            this.running = true
            this.refresh_thread = null
            this.on('sync', this.poll)
        },

        stop: function() {
            clearTimeout(this.refresh_thread)
            this.running = false
        },

        poll: function() {
            if (this.running) {
                clearTimeout(this.refresh_thread)
                this.refresh_thread = setTimeout(this.fetch, 5000)
            }
        }

    })
})
