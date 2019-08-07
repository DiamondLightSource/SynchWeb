define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'PROCESSINGJOBPARAMETERID',
        urlRoot: '/shipment/dewars',
            
        validation: {
            PROCESSINGJOBID: {
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
