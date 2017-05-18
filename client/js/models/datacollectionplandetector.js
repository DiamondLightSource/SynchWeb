define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'DATACOLLECTIONPLANHASDETECTORID',
        urlRoot: '/exp/plans/detectors',

        defaults: {
            EXPOSURETIME: null,
            DISTANCE: null,
            ROLL: null
        },
      
        validation: {
            DETECTORID: {
                required: true,
                pattern: 'number',
            },
            DATACOLLECTIONPLANID: {
                required: true,
                pattern: 'number',
            },
            EXPOSURETIME: {
                required: false,
                pattern: 'number',
            },
            DISTANCE: {
                required: false,
                pattern: 'number',
            },
            ROLL: {
                required: false,
                pattern: 'number',
            },

        },
    
    })
       
})
