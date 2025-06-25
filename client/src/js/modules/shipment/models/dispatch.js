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
        },

        VISIT: {
            required: function() {return this.visitRequired},
        },

        GIVENNAME: {
            required: function () {return this.dispatchDetailsRequired},
        },

        FAMILYNAME: {
            required: function () {return this.dispatchDetailsRequired},
        },

        PHONENUMBER: {
            required: function () {return this.dispatchDetailsRequired},
        },

        EMAILADDRESS: {
            required: function () {return this.dispatchDetailsRequired},
        },

        LABNAME: {
            required: function () {return this.dispatchDetailsRequired},
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
            required: function () {return this.dispatchDetailsRequired},
        },

        DELIVERYAGENT_AGENTNAME: {
            required: function() {return this.courierDetailsRequired},
        },

        DELIVERYAGENT_AGENTCODE: {
            required: function() {return this.courierDetailsRequired},
        },

        AWBNUMBER: {
            required: false,
        }

    },

    dispatchDetailsRequired: true,
    courierDetailsRequired: false, // We want to set this default to false unless 'DELIVERYAGENT_AGENTCODE' has a value in the shipment model
    postCodeRequired: false,
    visitRequired: true,
  })
       
})
