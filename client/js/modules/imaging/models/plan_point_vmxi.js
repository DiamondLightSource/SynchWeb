define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'DIFFRACTIONPLANID',
        urlRoot: '/sample/plan',

        initialize: function(attrs, options) {
            this.on('change:AXISRANGE change:NUMBEROFIMAGES change:AXISSTART', this.calculateAxisEnd)
            this.calculateAxisEnd()
        },

        calculateAxisEnd: function() {
            this.set('AXISEND', parseFloat(this.get('AXISSTART'))+(parseInt(this.get('NUMBEROFIMAGES'))*parseFloat(this.get('AXISRANGE'))))
            this.trigger('computed:changed')
        },

        computed: function() {
            return [
                'AXISEND'
            ]
        },


        defaults: {
            WAVELENGTH: 12658,
            AXISEND: 0,
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
                range: [0.001333333, 30],
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
                range: [0,1],
            },

            AXISSTART: {
                required: true,
                pattern: 'number',
                range: [-30,30]
            },

            AXISEND: {
                range: [-30,30]
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
