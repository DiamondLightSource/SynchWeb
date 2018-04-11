define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'DIFFRACTIONPLANID',
        urlRoot: '/sample/plan',

        computed: function() {
            return []
        },

        initialize: function(attrs, options) {
            if (options && options.beamlinesetup) {
                _.each(this.validation, function(v,k) {
                    var range = options.beamlinesetup.getRange({ field: k })
                    if (range) this.__proto__.validation[k].range = range
                }, this)
            }
        },

        validation: {
            EXPERIMENTKIND: {
                required: true,
                pattern: 'word',
            },

            PREFERREDBEAMSIZEX: {
                required: true,
                pattern: 'digits',
            },

            PREFERREDBEAMSIZEY: {
                required: true,
                pattern: 'digits',
            },

            AXISRANGE: {
                required: false,
                pattern: 'number',
            },

            EXPOSURETIME: {
                required: true,
                pattern: 'number',
            },

            TRANSMISSION: {
                required: true,
                pattern: 'number',
            },

            ENERGY: {
                required: true,
                pattern: 'digits',
            },

        },
      
    })
       
})
