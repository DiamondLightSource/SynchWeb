define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'BLSUBSAMPLEID',
        urlRoot: '/sample/sub',

        defaults: {
            WAVELENGTH: '',
            TRANSMISSION: '',
            BOXSIZEX: '',
            BOXSIZEY: '',
            NUMBEROFIMAGES: '',
            AXISSTART: '',
            AXISRANGE: '',
            KAPPASTART: '',
        },

        
        validation: {
            BLSAMPLEID: {
                required: true,
                pattern: 'number',
            },

            COMMENTS: {
                required: false,
            },

            X: {
                required: true,
                pattern: 'number',
            },

            Y: {
                required: true,
                pattern: 'number',
            },

            Z: {
                required: false
            }
        },
    })
    
})
