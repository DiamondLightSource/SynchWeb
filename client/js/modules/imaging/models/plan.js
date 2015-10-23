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

            PREFERREDBEAMSIZEX: {
                required: true,
                pattern: 'number',
            },

        },
      
    })
       
})
