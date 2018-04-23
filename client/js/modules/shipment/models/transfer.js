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
                pattern: 'wwsdash'
            },

            FAMILYNAME: {
                required: true,
                pattern: 'wwsdash'
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
                pattern: 'wwsdash'
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

            NEXTLOCATION: {
                required: true,
                pattern: 'wwsdash'
            },

            NEXTVISIT: {
                required: true,
                pattern: 'visit',
            },

            NEXTLOCALCONTACT: {
                required: true,
                pattern: 'wwsdash'
            },

            DELIVERYAGENT_SHIPPINGDATE: {
                pattern: 'edate',
                required: true,
            },

        },
            
    })
             
})
