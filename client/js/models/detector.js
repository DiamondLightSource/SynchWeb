define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'DETECTORID',
        urlRoot: '/exp/detector',
      
        validation: {
            DETECTORTYPE: {
                required: true,
                pattern: 'wwdash',
            },
            DETECTORMANUFACTURER: {
                required: true,
                pattern: 'wwdash',
            },
            DETECTORMODEL: {
                required: true,
                pattern: 'wwdash',
            },
            DETECTORPIXELSIZEHORIZONTAL: {
                required: false,
                pattern: 'number',
            },
            DETECTORPIXELSIZEVERTICAL: {
                required: false,
                pattern: 'number',
            },
            DETECTORDISTANCEMIN: {
                required: false,
                pattern: 'number',
            },
            DETECTORDISTANCEMAX: {
                required: false,
                pattern: 'number',
            },
            DENSITY: {
                required: false,
                pattern: 'number',
            },
            COMPOSITION: {
                required: false,
                pattern: 'word',
            },
            RESOLUTIONMIN: {
                required: false,
                pattern: 'number',
            },
            RESOLUTIONMAX: {
                required: false,
                pattern: 'number',
            },
        },
    
    })
       
})
