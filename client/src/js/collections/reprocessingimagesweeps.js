define(['backbone', 'backbone.paginator', 'models/reprocessingimagesweep'],
    function(Backbone, PageableCollection, ReprocessingImageSweep) {
    
    return PageableCollection.extend({
        model: ReprocessingImageSweep,
        mode: 'client',
        url: '/process/sweeps',

            
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
