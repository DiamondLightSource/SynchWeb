define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'DIFFRACTIONPLANID',
        urlRoot: '/sample/plan',

        defaults: [],

        initialize: function(attrs, options) {
            _.each(this.validation, function(v,k) {
                this.defaults[k] = v.pattern == 'word' || v.pattern == 'wwsdash' ? '' : null
            }, this)
        },

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
                required: false,
                pattern: 'number',
            },

            PREFERREDBEAMSIZEY: {
                required: false,
                pattern: 'number',
            },

            BOXSIZEX: {
                required: false,
                pattern: 'digits',
            },

            BOXSIZEY: {
                required: false,
                pattern: 'digits',
            },

            AXISRANGE: {
                required: false,
                pattern: 'number',
            },

            AXISSTART: {
                required: false,
                pattern: 'number',
            },

            NUMBEROFIMAGES: {
                required: false,
                pattern: 'digits',
            },

            TRANSMISSION: {
                required: false,
                pattern: 'number',
            },

            ENERGY: {
                required: false,
                pattern: 'digits',
            },

            MONOCHROMATOR: {
                required: false,
                pattern: 'word',
            },

            BEAMLINENAME: {
                required: false,
                pattern: 'wwdash',
            },
        },
      
    })
       
})
