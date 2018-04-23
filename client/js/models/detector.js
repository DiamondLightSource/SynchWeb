define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'DETECTORID',
        urlRoot: '/exp/detectors',
      
        defaults: [],

        initialize: function(attrs, options) {
            _.each(this.validation, function(v,k) {
                this.defaults[k] = v.pattern == 'word' || v.pattern == 'wwsdash' || v.pattern == 'wwdash' ? '' : null
            }, this)
        },

        validation: {
            DETECTORTYPE: {
                required: true,
                pattern: 'wwsldash',
            },
            DETECTORMANUFACTURER: {
                required: true,
                pattern: 'wwdash',
            },
            DETECTORMODEL: {
                required: true,
                pattern: 'wwsdash',
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
            DETECTORMAXRESOLUTION: {
                required: false,
                pattern: 'number',
            },
            DETECTORMINRESOLUTION: {
                required: false,
                pattern: 'number',
            },
            DETECTORROLLMIN: {
                required: false,
                pattern: 'number',
            },
            DETECTORROLLMAX: {
                required: false,
                pattern: 'number',
            },
            SENSORTHICKNESS: {
                required: false,
                pattern: 'digits',
            },
            DETECTORSERIALNUMBER: {
                required: false,
                pattern: 'wwdash',
            },
            NUMBEROFPIXELSX: {
                required: false,
                pattern: 'digits',
            },
            NUMBEROFPIXELSY: {
                required: false,
                pattern: 'digits',
            },
        },
    
    })
       
})
