define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'SCANPARAMETERSERVICEID',
        urlRoot: '/exp/parameters/services',
      
        validation: {
            NAME: {
                required: true,
                pattern: 'wwsdash',
            },
            DESCRIPTION: {
                required: true,
            },

        },
    
    })
       
})
