define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'DIFFRACTIONPLANID',
        urlRoot: '/sample/plan',

        computed: function() {
            return []
        },

        validation: {
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

            BOXSIZEX: {
                required: true,
                pattern: 'digits',
                range: [5,100],
            },

            BOXSIZEY: {
                required: true,
                pattern: 'digits',
                range: [5,100],
            },

            AXISRANGE: {
                required: false,
                pattern: 'number',
                range: [0,10],
            },

            TRANSMISSION: {
                required: true,
                pattern: 'number',
                range: [0,100],
            },

            ENERGY: {
                required: true,
                pattern: 'digits',
                range: [12658,12658]
            },

        },
      
    })
       
})
