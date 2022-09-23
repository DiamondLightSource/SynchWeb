define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'CONTAINERINSPECITONID',
        urlRoot: '/imaging/inspection',

        validation: {
            CONTAINERID: {
                required: true,
                pattern: 'number',
            },

            INSPECTIONTYPEID: {
                required: true,
                pattern: 'number',
            },

            TEMPERATURE: {
                required: true,
                pattern: 'number',
            },

            BLTIMESTAMP: {
                required: true,
                pattern: 'datetime',
            }
        },
      
    })
       
})
