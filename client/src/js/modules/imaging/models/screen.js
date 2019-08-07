define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'SCREENID',
        urlRoot: '/imaging/screen',
          
        defaults: {
            COMPONENTS: 0,
            GROUPS: 0,
        },

        validation: {
            NAME: {
                required: true,
                pattern: 'wwsdash',
            },
        },
      
    })
       
})
