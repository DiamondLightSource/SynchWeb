define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'DIFFRACTIONPLANID',
        urlRoot: '/sample/plan',

        defaults: {
            WAVELENGTH: 12658,
        },

        validation: {
            EXPERIMENTKIND: {
                required: true,
                pattern: 'word',
            },

            REQUIREDRESOLUTION: {
                required: true,
                pattern: 'number',
                range: [1.2,80],
            },

            EXPOSURETIME: {
                required: true,
                pattern: 'number',
                range: [0.04, 30],
            },

            PREFERREDBEAMSIZEX: {
                required: true,
                pattern: 'digits',
                range: [2,30],
            },

            PREFERREDBEAMSIZEY: {
                required: true,
                pattern: 'digits',
                range: [2,30],
            },

            AXISRANGE: {
                required: false,
                pattern: 'number',
                range: [0,10],
            },

            AXISSTART: {
                required: true,
                pattern: 'number',
                range: [-25,25]
            },

            NUMBEROFIMAGES: {
                required: true,
                pattern: 'digits',
                range: [0,9999],
            },

            TRANSMISSION: {
                required: true,
                pattern: 'number',
                range: [0, 100],
            },

            ENERGY: {
                required: true,
                pattern: 'digits',
                range: [12658,12658]
            },
        },
      
    })
       
})
