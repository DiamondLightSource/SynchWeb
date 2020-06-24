define(['backbone'], function(Backbone) {
    
    var Model = Backbone.Model.extend({
        idAttribute: 'FACILITYCODE',
        urlRoot: '/shipment/dewars/registry',
        _fcCache: {},

        defaults: {
            new: false,    
        },
            
        validation: {
            FACILITYCODE: {
                required: true,
                fn: 'validateFacilityCode',
            },

            NEWFACILITYCODE: {
                required: false,
                fn: 'validateFacilityCode',
            },
            PURCHASEDATE: {
                required: false,
                pattern: 'edate'
            },
        },

        validateFacilityCode: function(value, attr, state) {
            if (!Backbone.Validation.patterns.fcode.test(value)) {
                return Backbone.Validation.messages.fcode
            }

            if (this.get('new')) {
                if (!(value in this._fcCache)) {
                    var self = this
                    var tmp = new Model({ FACILITYCODE: value })
                    tmp.fetch({
                        data: { all: 1 },
                        async: false,
                        success: function() {
                            self._fcCache[value] = tmp.get('PROP')
                        },

                        failure: function() {
                            self._fcCache[value] = false
                        }
                    })
                }

                if (this._fcCache[value]) {
                    return 'That facility code is already registered to '+this._fcCache[value]
                }
            }
        }
    })

    // Moved this to re-use validation function.
    // It's optional because its not used to register new dewars
    // Model.prototype.validation.NEWFACILITYCODE = Model.prototype.validation.FACILITYCODE

    return Model
})