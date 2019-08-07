define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'PROJECTID',
        urlRoot: '/projects',
        
        validation: {
            TITLE: {
                required: true,
            },
            ACRONYM: {
                required: true,
                pattern: 'wwdash',
            },
        },
        
    })
    
})
