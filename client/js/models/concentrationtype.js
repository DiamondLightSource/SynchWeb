define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'CONCENTRATIONTYPEID',
        urlRoot: '/sample/concentrationtype',

        validation: {
            NAME: {
                required: true,
            },
            SYMBOL: {
                required: true,
            },
        },
    })
    
})
