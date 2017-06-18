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
            ADDRESS: {
                required: true,
                pattern: 'address',
            },
            CITY: {
                required: true,
                pattern: 'wwsdash',
            },
            COUNTRY: {
                required: true,
                pattern: 'wwsdash',
            },
            POSTCODE: {
                required: true,
                pattern: 'wwdash',
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
