define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'SCHEDULEID',
        urlRoot: '/imaging/schedule',
          
        defaults: {
            CONTAINERS: 0,
            SCHEDULECOMPONENTS: 0,
        },

        validation: {
            NAME: {
                required: true,
                pattern: 'wwsdash',
            },
        },
      
    })
       
})
