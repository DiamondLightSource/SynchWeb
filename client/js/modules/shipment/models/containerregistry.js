define(['backbone'], function(Backbone) {
    
    var Model = Backbone.Model.extend({
        idAttribute: 'CONTAINERREGISTRYID',
        urlRoot: '/shipment/containers/registry',
            
        validation: {
            BARCODE: {
                required: true,
                pattern: 'wwdash',
            },
        }
    })

    return Model
})
