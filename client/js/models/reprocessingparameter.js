define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'REPROCESSINGPARAMETERID',
        urlRoot: '/shipment/dewars',
            
        validation: {
            REPROCESSINGID: {
                pattern: 'digits',
                required: true,
            },
            
            PARAMETERKEY:{
                pattern: 'wwdash',
                required: true
            },

            PARAMETERVALUE:{
                pattern: 'wwdash',
                required: true
            },
        },
        
    })

})
