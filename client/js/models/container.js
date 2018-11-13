define(['backbone'], function(Backbone) {
    
    var Container = Backbone.Model.extend({
        idAttribute: 'CONTAINERID',
        urlRoot: '/shipment/containers',
        _cache: {},
        
        defaults: {
            BARCODECHECK: null
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
                pattern: 'number',
                required: function() {
                    return (this.get('REQUESTEDIMAGERID') != '' && this.get('REQUESTEDIMAGERID') != null)
                }
            },

            REQUESTEDIMAGERID: {
                required: false,
                pattern: 'number',
            },

            BARCODE: {
                pattern: 'wwdash',
                required: function() {
                    return (this.get('REQUESTEDIMAGERID') != '' && this.get('REQUESTEDIMAGERID') != null) || this.get('CONTAINERTYPE') == 'PCRStrip'
                }
            },

            BARCODECHECK: function(value, attr, state) {
                if (value !== null) {
                    if (value != 1) return 'Barcode check failed'
                }
            },

            EXPERIMENTTYPE: {
                required: false,
                pattern: 'word',
            },

            STORAGETEMPERATURE: {
                required: false,
                pattern: 'wwdash',
            },

            CONTAINERREGISTRYID: {
                required: false,
                pattern: 'number',
            },

            AUTOMATED: {
                required: false,
                pattern: 'number',
            }
        },
        
    })

    return Container
    
})