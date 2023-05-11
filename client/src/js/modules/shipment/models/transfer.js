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

            NEXTLOCATION: function(input, field, attributes) {
                if (!input && attributes.NEXTVISIT) {
                    return 'This field must contain only letters, numbers, spaces, underscores, and dashes'
                }
            },

            NEXTVISIT: {
                required: false,
                pattern: 'visitornull',
            },

            NEXTLOCALCONTACT: function(input, field, attributes) {
                if (!input && attributes.NEXTVISIT) {
                    return 'This field must contain only letters, numbers, spaces, underscores, and dashes'
                }
            },

            DELIVERYAGENT_SHIPPINGDATE: {
                pattern: 'edate',
                required: true,
            },

        },
            
    })
             
})
