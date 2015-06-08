define(['backbone'], function(Backbone) {
    
  return Backbone.Model.extend({
    urlRoot: '/shipment/dewars/transfer',
      
    validation: {
        FACILITYCODE: {
            pattern: 'fcode',
            required: false,
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

        LOCATION: {
          required: true,
        },

        VISIT: {
          required: true,
        },

        LOCALCONTACT: {
          required: true,
        },

        NEXTLOCATION: {
          required: true,
        },

        NEXTVISIT: {
          required: true,
        },

        NEXTLOCALCONTACT: {
          required: true,
        },

        DELIVERYAGENT_SHIPPINGDATE: {
          pattern: 'edate',
          required: true,
        },

    },
      
  })
       
})
