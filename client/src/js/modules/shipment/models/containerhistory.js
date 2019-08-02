define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'CONTAINERHISTORYID',
        urlRoot: '/shipment/containers/history',
            
        validation: {
            BARCODE: {
                required: true,
                pattern: 'wwdash',
            },

            LOCATION: {
                required: true,
                pattern: 'number',
            },

            STATUS: {
                required: true,
                pattern: 'word',
            }
        }
    })
})
