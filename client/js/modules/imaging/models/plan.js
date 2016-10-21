define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'DIFFRACTIONPLANID',
        urlRoot: '/sample/plan',

        validation: {
            COMMENTS: {
                required: true,
                pattern: 'wwsdash',
            },

            EXPERIMENTKIND: {
                required: true,
                pattern: 'word',
            },

            REQUIREDRESOLUTION: {
                required: true,
                pattern: 'number',
            },

            EXPOSURETIME: {
                required: true,
                pattern: 'number',
            },

            PREFERREDBEAMSIZEX: {
                required: true,
                pattern: 'number',
            },

            PREFERREDBEAMSIZEY: {
                required: true,
                pattern: 'number',
            },

            BOXSIZEX: {
                required: true,
                pattern: 'digits',
            },

            BOXSIZEY: {
                required: true,
                pattern: 'digits',
            },

            AXISRANGE: {
                required: true,
                pattern: 'number',
            },

            AXISSTART: {
                required: true,
                pattern: 'number',
            },

            NUMBEROFIMAGES: {
                required: true,
                pattern: 'digits',
            },

            TRANSMISSION: {
                required: true,
                pattern: 'number',
            },

            WAVELENGTH: {
                required: true,
                pattern: 'digits',
            },

            MONOCHROMATOR: {
                required: true,
                pattern: 'word',
            },
        },
      
    })
       
})
