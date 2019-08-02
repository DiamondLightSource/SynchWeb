define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'PROCESSINGJOBIMAGESWEEPID',
        urlRoot: '/process/sweeps',
            
        validation: {
            PROCESSINGJOBID: {
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
