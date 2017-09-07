define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'LABCONTACTID',
        urlRoot: '/contact',
      
        validation: {
            CARDNAME: {
                required: true,
                pattern: 'wwsdash',
            },
            FAMILYNAME: {
                required: true,
                pattern: 'wwdash',
            },
            GIVENNAME: {
                required: true,
                pattern: 'wwdash',
            },
            PHONENUMBER: {
                required: true,
            },
            EMAILADDRESS: {
                pattern: 'email',
                required: false,
            },
            LABNAME: {
                required: true,
                pattern: 'wwsdash',
            },
            ADDRESS: function(value, attr, state) {
                if (!value) {
                    return Backbone.Validation.messages.required
                }

                if (!Backbone.Validation.patterns.address.test(value)) {
                    return Backbone.Validation.messages.address
                }

                var lines = value.split('\n')
                if (lines.length > 3) {
                    return 'Address can only be a maximum of three lines'
                }
            },
            CITY: {
                required: true,
                pattern: 'wwsdash',
            },
            COUNTRY: {
                required: true,
                pattern: 'country',
            },
            POSTCODE: {
                required: true,
                pattern: 'wwsdash',
            },
            DEFAULTCOURRIERCOMPANY: {
                pattern: 'wwsdash',
                required: false,
            },
            COURIERACCOUNT: {
                pattern: 'wwdash',
                required: false,
            },
            BILLINGREFERENCE: {
                pattern: 'wwsdash',
                required: false,
            },
            DEWARAVGCUSTOMSVALUE: {
                pattern: 'number',
                required: false,
            },
            DEWARAVGTRANSPORTVALUE: {
                pattern: 'number',
                required: false,        
            },
        },

    })

})
