define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'LIGANDID',
        urlRoot: '/sample/ligands',

        validation: {
            
        },
    })
    
})
