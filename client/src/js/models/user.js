define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        urlRoot: '/users',
        idAttribute: 'PERSONID',

        validation: {
            LOGIN: {
                required: true,
                pattern: 'wwdash',
            },
            FAMILYNAME: {
                required: true,
                pattern: 'wwdash',
            },
            GIVENNAME: {
                required: true,
                pattern: 'wwdash',
            },
            EMAILADDRESS: {
                pattern: 'email',
                required: false,
            },
        }
    })
    
})