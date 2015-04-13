define(['backbone.paginator'], function(PageableCollection) {


    var Blended = Backbone.Model.extend({
        idAttribute: 'ID',

        initialize: function(options) {
            this.on('change', this.addFields, this)
            this.addFields()
        },

        addFields: function() {
            this.set('FILES', this.get('IDS').length)
            //this.set('STATUSICON', '')
            this.set('SUCCESS', this.get('STATE') == 1)

            var val = ['<i class="c fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="c fa icon green fa-check alt="Completed"></i>',
                    '<i class="c fa icon red fa-times alt="Failed"></i>']

            this.set('STATUSICON', val[parseInt(this.get('STATE'))])
        },

    })
       
    return PageableCollection.extend({
        model: Blended,
        mode: 'client',
        url: function() { return '/mc/blended/visit/'+this.visit + (this.user ? '/user/'+_.result(this, 'user') : '') },
      
        initialize: function(models, options) {
            if (options) this.visit = options.visit

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

        state: {
            pageSize: 15,
            order: 1,
        }
    })
      
})