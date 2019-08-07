define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'COMPONENTTYPEID',
        urlRoot: '/sample/componenttype',

        validation: {
            NAME: {
                required: false,
                pattern: 'wwsbdash',
            },
        },
    })
    
})
