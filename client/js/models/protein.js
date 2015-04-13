define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'PROTEINID',
        urlRoot: '/sample/proteins',
        
        validation: {
            ACRONYM: {
                required: true,
                pattern: 'wwdash',
            },
            SEQUENCE: {
                required: false,
                pattern: 'word',
            },
            MOLECULARMASS: {
                required: false,
                pattern: 'number',
            },
        },
    })
    
})
