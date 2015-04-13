define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        urlRoot: '/feedback',
        validation: {
            name: {
                required: true,
            },
            email: {
                required: true,
                pattern: 'email',
            },
            feedback: {
                required: true,
            },
        },
        
    })

})
