define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        urlRoot: '/users',
        idAttribute: 'PERSONID',

        validation: {
        	LOGIN: {
                pattern: 'word',
                required: true,
            },
            GIVENNAME: {
                pattern: 'wwdash',
                required: true,
            },
            FAMILYNAME: {
                pattern: 'wwdash',
                required: true,
            },
            PASSWORD: {
                required: false,
            },
        }
    })
    
})