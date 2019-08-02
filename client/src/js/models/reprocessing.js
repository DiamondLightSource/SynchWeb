define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'PROCESSINGJOBID',
        urlRoot: '/process',
            
        validation: {
            DATACOLLECTIONID: {
                required: true,
                pattern: 'digits',
            },
            
            COMMENTS:{
                required: false,
                pattern: 'wwsdash',
            },

            DISPLAYNAME:{
                required: false,
                pattern: 'wwdash',
            },
            
        }

    })

})
