define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'IMAGERID',
        urlRoot: '/imaging/imager',
          
        validation: {
            NAME: {
                required: true,
                pattern: 'wwsdash',
            },

            CAPACITY: {
                required: true,
                pattern: 'number',
            },

            TEMPERATURE: {
                required: true,
                pattern: 'number',
            },

            SERIAL: {
                required: true,
                pattern: 'wwsdash',
            },
        },
      
    })
       
})
