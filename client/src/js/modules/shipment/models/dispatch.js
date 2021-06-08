define(['backbone'], function(Backbone) {
    
  return Backbone.Model.extend({
    urlRoot: '/shipment/dewars/dispatch',

    validation: {
        
        FACILITYCODE: {
            pattern: 'fcode',
            required: false,
        },

        LOCATION: {
            required: true,
            pattern: 'wwsdash'
        },

        VISIT: {
            required: true,
            pattern: 'visit',
        },

        LOCALCONTACT: {
            required: true,
            pattern: 'wwsdash'
        },



        GIVENNAME: {
            required: true,
            pattern: 'wwdash',
        },

        FAMILYNAME: {
            required: true,
            pattern: 'wwdash',
        },

        PHONENUMBER: {
            required: true,
        },

        EMAILADDRESS: {
            required: true,
            pattern: 'email',
        },

        LABNAME: {
            required: true,
            pattern: 'wwsdash',
        },

        ADDRESS: {
            required: true
        },



        DESCRIPTION: {
            required: true,
        },

        DELIVERYAGENT_SHIPPINGDATE: {
            pattern: 'edate',
            required: true,
        },

        
        DELIVERYAGENT_AGENTNAME: {
            required: function() {
                return this.shipmentHasAgentCode
            },
            pattern: 'wwsdash'
        },

        DELIVERYAGENT_AGENTCODE: {
            required: function() {
                return this.shipmentHasAgentCode
            }   
        },

        AWBNUMBER: {
            pattern: 'word',
            required: false,
        }

    },

    shipmentHasAgentCode: false, // We want to set this default to false unless 'DELIVERYAGENT_AGENTCODE' has a value in the shipment model
  })
       
})
