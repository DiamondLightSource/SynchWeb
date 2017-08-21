define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'REPROCESSINGIMAGESWEEPID',
        urlRoot: '/process/sweeps',
            
        validation: {
            REPROCESSINGID: {
                required: true,
                pattern: 'digits',
            },

            DATACOLLECTIONID: {
                required: true,
                pattern: 'digits',
            },

            STARTIMAGE: {
                required: true,
                pattern: 'digits',
            },

            ENDIMAGE: {
                required: true,
                pattern: 'digits',
            },
        },
        
    })

})
