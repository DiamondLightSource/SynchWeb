define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'SCREENCOMPONENTGROUPID',
        urlRoot: '/imaging/screen/groups',
        
        validation: {
            SCREENID: {
                required: true,
                pattern: 'number',
            },

            POSITION: {
                required: true,
                pattern: 'number'
            }
        },
      
    })
       
})
