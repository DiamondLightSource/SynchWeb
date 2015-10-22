define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'SCHEDULECOMPONENTID',
        urlRoot: '/imaging/schedule/components',
          
        defaults: {
            OFFSET_HOURS: '',
            INSPECTIONTYPEID: 0,
        },

        validation: {
            SCHEDULEID: {
                required: true,
                pattern: 'number',
            },
            
            OFFSET_HOURS: {
                required: true,
                pattern: 'number',
            },

            INSPECTIONTYPEID: {
                required: true,
                pattern: 'number',
            },
        },
      
    })
       
})
