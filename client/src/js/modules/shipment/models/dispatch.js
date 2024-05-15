define(['backbone'], function(Backbone) {
    
  return Backbone.Model.extend({
    urlRoot: '/shipment/dewars/dispatch',

    validation: {
        
        FACILITYCODE: {
            pattern: 'fcode',
            required: false,
        },

        LOCATION: {
            required: false,
            pattern: 'wwsdash'
        },

        VISIT: {
            required: function() {
                return this.visitRequired
            },
            pattern: 'visit',
        },

        GIVENNAME: {
            required: function () {return this.dispatchDetailsRequired},
            pattern: 'wwdash',
        },

        FAMILYNAME: {
            required: function () {return this.dispatchDetailsRequired},
            pattern: 'wwdash',
        },

        PHONENUMBER: {
            required: function () {return this.dispatchDetailsRequired},
        },

        EMAILADDRESS: {
            required: true,
            pattern: 'email',
        },

        LABNAME: {
            required: function () {return this.dispatchDetailsRequired},
            pattern: 'wwsdash',
        },

        ADDRESS: {
            required: function () {return this.dispatchDetailsRequired}
        },

        CITY: {
            required: function () {return this.dispatchDetailsRequired}
        },

        POSTCODE: {
            required: function() {
                return this.postCodeRequired && this.dispatchDetailsRequired
            }
        },

        COUNTRY: {
            required: function () {return this.dispatchDetailsRequired},
            pattern: 'country',
            fn: function (value, attr, state) {
                if (value === null) {
                    return 'That didn\'t work, please select again'
                }
            }
        },


        DESCRIPTION: {
            required: function () {return this.dispatchDetailsRequired},
        },

        DELIVERYAGENT_SHIPPINGDATE: {
            pattern: 'edate',
            required: function () {return this.dispatchDetailsRequired},
        },

        
        DELIVERYAGENT_AGENTNAME: {
            required: function() {
                return this.courierDetailsRequired
            },
            pattern: 'wwsdash'
        },

        DELIVERYAGENT_AGENTCODE: {
            required: function() {
                return this.courierDetailsRequired
            }   
        },

        AWBNUMBER: {
            pattern: 'word',
            required: false,
        }

    },

    dispatchDetailsRequired: true,
    courierDetailsRequired: false, // We want to set this default to false unless 'DELIVERYAGENT_AGENTCODE' has a value in the shipment model
    postCodeRequired: false,
    visitRequired: true,
  })
       
})
