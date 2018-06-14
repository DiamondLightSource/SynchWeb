define(['backbone'], function(Backbone) {
    
    var Model = Backbone.Model.extend({
    	idAttribute: 'FACILITYCODE',
        urlRoot: '/shipment/dewars/registry',
        _fcCache: {},

        defaults: {
            new: false,    
        },
            
        validation: {
            FACILITYCODE: function(value, attr, state) {
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
            },

        	LABCONTACTID: {
        		required: true,
        		pattern: 'number',
        	},
        }
    })

    Model.prototype.validation.NEWFACILITYCODE = Model.prototype.validation.FACILITYCODE

    return Model
})