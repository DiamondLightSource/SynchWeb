define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'PUID',
        urlRoot: '/projects/users',
        
        validation: {
            PROJECTID: {
                required: true,
                pattern: 'number',
            },
        
            USERNAME: {
                required: true,
                pattern: 'word',
            },
        },
    })
    
})
