define(['backbone'], function(Backbone) {
    
    var Container = Backbone.Model.extend({
        idAttribute: 'CONTAINERID',
        urlRoot: '/shipment/containers',
        _cache: {},
        
        defaults: {
            new: false,
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

            // BARCODE: {
            //     pattern: 'wwdash',
            //     required: function() {
            //         return this.get('REQUESTEDIMAGERID') != '' || this.get('CONTAINERTYPE') == 'PCRStrip'
            //     }
            // },

            BARCODE: _.debounce(function(value, attr, state) {
                if ((this.get('REQUESTEDIMAGERID') != '' || this.get('CONTAINERTYPE') == 'PCRStrip') && !value) {
                    return Backbone.Validation.messages.required
                } else if (!value) return

                if (!Backbone.Validation.patterns.wwdash.test(value)) {
                    return Backbone.Validation.messages.wwdash
                }

                if (!(value in this._cache)) {
                    var self = this
                    Backbone.ajax({
                        url: app.apiurl+'/shipment/containers/barcode/'+value,
                        async: false,
                        success: function(resp) {
                            console.log('container', resp)
                            self._cache[value] = resp.PROP
                        },

                        failure: function() {
                            self._cache[value] = false
                        }
                    })
                }

                if (this._cache[value]) {
                    return 'That barcode is already registered to '+this._cache[value]
                }
            }, 200),

        },
        
    })

    return Container
    
})