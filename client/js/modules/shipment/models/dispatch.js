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
        },

        VISIT: {
        	required: true,
        },

        LOCALCONTACT: {
        	required: true,
        },



        GIVENNAME: {
        	required: true,
        },

        FAMILYNAME: {
        	required: true,
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
        },

        ADDRESS: {
        	required: true,
        },



        DESCRIPTION: {
        	required: true,
        },

        DELIVERYAGENT_SHIPPINGDATE: {
        	pattern: 'edate',
        	required: true,
        },

        
        DELIVERYAGENT_AGENTNAME: {
        	required: true
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
