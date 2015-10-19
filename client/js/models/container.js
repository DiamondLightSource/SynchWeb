define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'CONTAINERID',
        urlRoot: '/shipment/containers',
        
        validation: {
            NAME: {
                required: true,
                pattern: 'wwdash',
            },
        
            CAPACITY: {
                required: true,
                pattern: 'number',
            },
        
            CONTAINERTYPE: {
                required: true,
                pattern: 'word',
            },

            SCHEDULEID: {
                required: false,
                pattern: 'number',
            }
        },
        
    })
    
})