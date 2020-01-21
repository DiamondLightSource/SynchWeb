define(['backbone', 'backbone.paginator', 'models/reprocessingparameter'],
    function(Backbone, PageableCollection, ReprocessingParameter) {
    
    return PageableCollection.extend({
        model: ReprocessingParameter,
        mode: 'client',
        url: '/process/params',

            
        state: {
            pageSize: 15,
        },


        // Allow collection saving
        save: function(options) {
            options = _.extend({}, options)
            
            var col = this
            var success = options.success
            options.success = function(resp) {
                col.reset(resp, { silent: true })
                if (success) success(col, resp, options)
            }
            
            return Backbone.sync('create', this, options)
        },
    })
})
