define(['backbone'], function(Backbone) {

    var Lookup = Backbone.Model.extend({
        urlRoot: '/proposal/lookup',

        initialize: function(options) {
            this.field = options.field
            this.value = options.value
        },


        find: function(options) {
            var data = {}
            data[this.field] = this.value

            var self = this
            this.fetch({
                data: data,
                type: 'POST',

                success: function() {
                    app.cookie(self.get('PROP'), function() {
                        if (options.success) options.success()
                    })
                }, 

                error: function() {
                    if (options.error) options.error()
                }
            })
        }
        
    })

    return Lookup
})