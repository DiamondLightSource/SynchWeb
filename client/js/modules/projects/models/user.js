define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'PPID',
        urlRoot: '/projects/users',
        
        validation: {
            PROJECTID: {
                required: true,
                pattern: 'number',
            },
        
            PERSONID: {
                required: true,
                pattern: 'number',
            },
        },
    })
    
})
