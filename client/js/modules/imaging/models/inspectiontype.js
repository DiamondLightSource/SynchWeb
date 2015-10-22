define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'INSPECTIONTYPEID',
        urlRoot: '/imaging/inspection/types',
          
        validation: {
            NAME: {
                required: true,
                pattern: 'word',
            }
        },
        
    })
       
})
