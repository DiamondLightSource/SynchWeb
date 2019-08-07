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
            required: true,
            pattern: 'wwsdash'
        },

        DELIVERYAGENT_AGENTCODE: {
            required: function() {
                return !(this.get('FACILITYCODE'))
            }   
        },

        AWBNUMBER: {
            pattern: 'word',
            required: false,
        }

    },
      
  })
       
})
