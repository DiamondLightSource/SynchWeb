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

            EXPOSURETIME: {
                required: true,
                pattern: 'number',
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
