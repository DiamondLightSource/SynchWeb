define(['backbone'], function(Backbone) {
    
    var Container = Backbone.Model.extend({
        idAttribute: 'CONTAINERID',
        urlRoot: '/shipment/containers',
        _cache: {},
        
        defaults: {
            BARCODETEST: null
        },

        validation: {
            NAME: {
                required: true,
                pattern: 'wwdash',
            },
        
            CAPACITY: {
                required: true,
                pattern: 'number',
            },
        
            CONTAINERTYPE: {
                required: true,
                pattern: 'word',
            },

            SCHEDULEID: {
                required: false,
                pattern: 'number',
            },

            REQUESTEDIMAGERID: {
                required: false,
                pattern: 'number',
            },

            BARCODE: {
                pattern: 'wwdash',
                required: function() {
                    return this.get('REQUESTEDIMAGERID') != '' || this.get('CONTAINERTYPE') == 'PCRStrip'
                }
            },

            BARCODECHECK: function(value, attr, state) {
                if (value !== null) {
                    if (value != 1) return 'Barcode check failed'
                }
            },
        },
        
    })

    return Container
    
})